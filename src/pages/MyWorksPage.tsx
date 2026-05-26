import { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { getStoredGenerationJobs, removeStoredGenerationJob } from '../api/generationStorage';
import { fontifyApi } from '../api/fontifyApi';
import { mapGenerationStatusToWorkItem } from '../api/mappers';
import { mockWorkItems } from '../mocks/works';
import type { WorkItem, WorkTimelineLog } from '../types/work';

const progressSteps = ['영문 분석', '14자 시그니처 생성', 'AI 재학습', '2,350자 완성'] as const;

const algorithmSteps = [
  {
    title: '영문 스타일 분석',
    body: '선택한 영문 폰트의 곡선, 굵기, 기울기, 자간 특징을 분석해 한글 생성 기준을 만듭니다.',
  },
  {
    title: '시그니처 14자 생성',
    body: '분석한 스타일을 바탕으로 한글 조합을 대표하는 14자 미리보기를 먼저 생성합니다.',
  },
  {
    title: 'AI 재학습',
    body: '미리보기 결과를 기준으로 전체 한글 글리프의 형태와 일관성을 학습합니다.',
  },
  {
    title: '최종 폰트 빌드',
    body: '학습된 결과를 TTF/OTF 파일로 빌드해 다운로드 가능한 폰트로 정리합니다.',
  },
];

function clampPercent(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function getStepProgress(totalProgress: number, index: number) {
  const stepStart = index * 25;
  return clampPercent(((totalProgress - stepStart) / 25) * 100);
}

function getStepState(totalProgress: number, index: number) {
  const stepProgress = getStepProgress(totalProgress, index);
  if (stepProgress >= 100) return 'done';
  if (stepProgress > 0) return 'active';
  return 'waiting';
}

function getFailedStageIndex(work: WorkItem) {
  if (work.downloadUrl) return 3;
  if (work.previewImageUrls?.length || work.previewLetters?.length) return 2;
  return 0;
}

function hasPreviewGeneratedBeforeFailure(work: WorkItem) {
  return work.phase === 'failed' && getFailedStageIndex(work) >= 2;
}

function getProcessStageState(work: WorkItem, index: number) {
  if (work.phase === 'failed') {
    const failedStageIndex = getFailedStageIndex(work);
    if (index < failedStageIndex) return 'done';
    if (index === failedStageIndex) return 'failed';
    return 'waiting';
  }
  if (work.phase === 'queued') return 'waiting';
  if (work.phase === 'analyzing') return index === 0 ? 'active' : 'waiting';
  if (work.phase === 'preview_ready') return index < 2 ? 'done' : 'waiting';
  if (work.phase === 'retraining') {
    if (index < 2) return 'done';
    return index === 2 ? 'active' : 'waiting';
  }
  if (work.phase === 'finalizing') {
    if (index < 3) return 'done';
    return 'active';
  }
  return 'done';
}

function getProcessStageStatus(work: WorkItem, index: number) {
  if (work.phase === 'failed') {
    const failedStageIndex = getFailedStageIndex(work);
    if (index < failedStageIndex) return '완료';
    return index === failedStageIndex ? '실패' : '대기';
  }

  const stepProgress = getStepProgress(work.progressPercent, index);
  const state = getProcessStageState(work, index);
  if (state === 'done') return '완료';
  if (state === 'active') return `진행 중 (${stepProgress}%)`;
  return '대기';
}

function getPhaseMessage(work: WorkItem) {
  if (work.phase === 'failed') {
    return {
      title: '생성 요청 실패',
      body:
        work.failReason ??
        '작업이 완료되기 전에 중단되었습니다. 백엔드 응답과 요청 로그를 확인해 주세요.',
    };
  }

  if (work.phase === 'queued') {
    return {
      title: '영문 분석 준비 중',
      body: '아직 한글 미리보기 결과가 없습니다. 영문 분석이 끝나면 14자 미리보기가 생성됩니다.',
    };
  }

  if (work.phase === 'analyzing') {
    return {
      title: '영문 분석 중',
      body: '영문 폰트의 곡선, 굵기, 기울기 특징을 분석하고 있습니다.',
    };
  }

  if (work.phase === 'preview_ready') {
    return {
      title: '14자 미리보기 생성 완료',
      body: '기초 글자 14자 미리보기가 생성되었습니다. 곧 AI 재학습이 시작됩니다.',
    };
  }

  if (work.phase === 'retraining') {
    return {
      title: 'AI 재학습 중',
      body: '14자 미리보기를 기준으로 전체 한글 글리프의 스타일과 일관성을 학습하고 있습니다.',
    };
  }

  if (work.phase === 'finalizing') {
    return {
      title: '2,350자 완성 중',
      body: '전체 글리프를 폰트 파일로 빌드하고 있습니다. 완료되면 완성 폰트 보기가 활성화됩니다.',
    };
  }

  return {
    title: '2,350자 완성',
    body: '폰트 생성이 완료되었습니다. 완성 페이지에서 미리보기와 다운로드를 확인할 수 있습니다.',
  };
}

function getDisplayPhaseMessage(work: WorkItem) {
  if (work.phase === 'failed' && (work.previewImageUrls?.length || work.previewLetters?.length)) {
    return {
      title: '미리보기 생성 후 최종 생성 실패',
      body:
        work.failReason ??
        '미리보기 이미지는 생성되었지만 최종 폰트 파일 생성이 완료되지 않았습니다.',
    };
  }

  return getPhaseMessage(work);
}

function isPreviewAvailable(work: WorkItem) {
  return (
    work.phase !== 'queued' &&
    work.phase !== 'analyzing' &&
    Boolean(work.previewImageUrls?.length || work.previewLetters?.length)
  );
}

function buildSelectedUrl(work: WorkItem) {
  if (work.phase !== 'completed' || (!work.jobId && !work.generatedFontId)) return '';

  const params = new URLSearchParams();
  if (work.jobId) params.set('jobId', String(work.jobId));
  if (work.generatedFontId) params.set('generatedFontId', String(work.generatedFontId));
  if (work.sourceFontId) params.set('sourceFontId', String(work.sourceFontId));
  if (work.sourceFontName) params.set('family', work.sourceFontName);

  return `#/selected?${params.toString()}`;
}

function ProgressStepper({ work }: { work: WorkItem }) {
  const normalizedProgress = clampPercent(work.progressPercent);

  return (
    <div className="workStepper" aria-label="폰트 생성 진행 단계">
      <div className="workStepper__track" aria-hidden="true">
        <span style={{ width: `${normalizedProgress}%` }} />
      </div>
      <div className="workStepper__items">
        {progressSteps.map((step, index) => {
          const state = getProcessStageState(work, index);

          return (
            <div className={`workStepper__item is-${state}`} key={step}>
              <div className="workStepper__dot">
                {state === 'done' ? '✓' : state === 'failed' ? '!' : `0${index + 1}`}
              </div>
              <p>
                <strong>{step}</strong>
                <span>{getProcessStageStatus(work, index)}</span>
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PreviewGrid({ work }: { work: WorkItem }) {
  const normalizedProgress = clampPercent(work.progressPercent);
  const phaseMessage = getDisplayPhaseMessage(work);

  return (
    <section className="workPreview">
      <header className="workPreview__header">
        <h3>14자 한글 폰트 미리보기</h3>
        <div className="workPreview__score">
          <span>전체 작업 진행률</span>
          <div aria-hidden="true">
            <i style={{ width: `${normalizedProgress}%` }} />
          </div>
          <strong>{normalizedProgress}%</strong>
        </div>
      </header>

      {!isPreviewAvailable(work) ? (
        <div className="workPreview__empty">
          <strong>{work.phase === 'failed' ? '작업이 시작되지 않았습니다' : '미리보기 생성 전'}</strong>
          <p>
            {work.phase === 'failed'
              ? work.failReason ?? '생성 요청이 실패하여 미리보기를 만들지 못했습니다.'
              : '영문 분석이 완료되면 이 영역에 14자 한글 미리보기가 표시됩니다.'}
          </p>
        </div>
      ) : work.previewImageUrls?.length ? (
        <div className="workPreview__grid workPreview__grid--images">
          {work.previewImageUrls.map((imageUrl, index) => (
            <div className={`workPreview__imageCard ${index === 2 ? 'is-selected' : ''}`} key={imageUrl}>
              <img src={imageUrl} alt={work.previewLetters?.[index] ?? `미리보기 ${index + 1}`} />
              <span>{work.previewLetters?.[index] ?? `미리보기 ${index + 1}`}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="workPreview__grid">
          {work.previewLetters?.map((letter, index) => (
            <div className={`workPreview__letter ${index === 2 ? 'is-selected' : ''}`} key={letter}>
              {letter}
            </div>
          ))}
        </div>
      )}

      {work.phase !== 'completed' ? (
        <div className="workPreview__notice" role="status">
          <strong>{phaseMessage.title}</strong>
          <p>{phaseMessage.body}</p>
        </div>
      ) : null}
    </section>
  );
}

function WorkTimeline({ logs }: { logs: WorkTimelineLog[] }) {
  return (
    <section className="workTimeline" aria-label="작업 타임라인">
      <header>
        <h3>상세 타임라인</h3>
        <p>백엔드 상태와 요청 로그를 기준으로 작업 기록을 표시합니다.</p>
      </header>
      <ol>
        {logs.map((log) => (
          <li className={`is-${log.state}`} key={log.id}>
            <span>{log.time}</span>
            <div>
              <strong>{log.title}</strong>
              <p>{log.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function WorkCard({
  work,
  expanded,
  onToggle,
  onDelete,
}: {
  work: WorkItem;
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const selectedUrl = buildSelectedUrl(work);
  const completedHref = selectedUrl || work.downloadUrl || '#';
  const completedDisabled = !selectedUrl && !work.downloadUrl;

  return (
    <article className="workActiveCard">
      <header className="workActiveCard__header">
        <div>
          <h2>{work.title}</h2>
          <p>{work.updatedAt}</p>
        </div>
        <span className={work.phase === 'failed' ? 'is-failed' : ''}>{work.statusLabel}</span>
      </header>

      <ProgressStepper work={work} />
      <PreviewGrid work={work} />

      <div className="workActiveCard__actions">
        {work.phase === 'completed' ? (
          <a
            className="workDownloadButton"
            href={completedHref}
            aria-disabled={completedDisabled}
            onClick={(event) => {
              if (completedDisabled) event.preventDefault();
            }}
          >
            완성 폰트 보기
          </a>
        ) : work.phase === 'failed' ? (
          <button className="is-primary" type="button" onClick={onToggle} aria-expanded={expanded}>
            {expanded
              ? '실패 내역 닫기'
              : hasPreviewGeneratedBeforeFailure(work)
                ? '최종 생성 실패 내역 보기'
                : '실패 내역 보기'}
          </button>
        ) : (
          <button className="is-primary" type="button" onClick={onToggle} aria-expanded={expanded}>
            {expanded ? '상세 타임라인 닫기' : '진행 상황 자세히 보기'}
          </button>
        )}

        {work.phase === 'failed' ? (
          <a className="workRetryButton" href="#/english-fonts">
            다시 시도
          </a>
        ) : work.phase === 'completed' ? (
          <button type="button" onClick={onDelete}>
            내역 삭제
          </button>
        ) : (
          <button type="button">{work.statusLabel === 'QUEUED' ? '작업 취소' : '학습 중단'}</button>
        )}

        {work.phase === 'failed' ? (
          <button type="button" onClick={onDelete}>
            실패 내역 삭제
          </button>
        ) : null}
      </div>

      {expanded ? <WorkTimeline logs={work.logs} /> : null}
    </article>
  );
}

function AlgorithmPanel({ progressPercent }: { progressPercent: number }) {
  const normalizedProgress = clampPercent(progressPercent);

  return (
    <aside className="worksSide">
      <section className="worksPanel">
        <h3>
          <span aria-hidden="true">AI</span>
          Fontify 알고리즘
        </h3>
        <ol className="worksAlgoList">
          {algorithmSteps.map((step, index) => (
            <li className={`is-${getStepState(normalizedProgress, index)}`} key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="worksInsight">
        <div>
          <span>AI INSIGHT</span>
          <strong>실시간 스타일 학습 데이터</strong>
        </div>
      </section>

      <section className="worksAction">
        <h3>새로운 작업 시작하기</h3>
        <p>새로운 영문 폰트를 선택하고 한글 폰트 생성을 요청해 보세요.</p>
        <a href="#/english-fonts">학습 요청</a>
      </section>
    </aside>
  );
}

function WorkListStatus({ title, body }: { title: string; body: string }) {
  return (
    <section className="workListStatus">
      <h2>{title}</h2>
      <p>{body}</p>
      <a href="#/english-fonts">새 작업 요청하기</a>
    </section>
  );
}

export default function MyWorksPage() {
  const [expandedWorkIds, setExpandedWorkIds] = useState<string[]>([]);
  const [workItems, setWorkItems] = useState<WorkItem[]>(mockWorkItems);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    let isPolling = false;

    const loadJobs = async () => {
      if (isPolling) return;
      isPolling = true;

      try {
        const jobs = await fontifyApi.getMyGenerations();
        const storedJobs = getStoredGenerationJobs();

        if (jobs.length === 0) {
          if (!isMounted) return;
          setWorkItems([]);
          setLoadError('');
          return;
        }

        const results = await Promise.allSettled(
          jobs.map(async (job) => {
            const status = await fontifyApi.getGenerationStatus(job.job_id);
            const storedJob = storedJobs.find((item) => item.jobId === job.job_id);

            return mapGenerationStatusToWorkItem(
              {
                jobId: job.job_id,
                fontFileId: storedJob?.fontFileId ?? 0,
                fontName: storedJob?.fontName ?? job.font_name,
                requestedAt: job.requested_at,
              },
              status,
            );
          }),
        );

        const resolvedItems = results
          .filter((result): result is PromiseFulfilledResult<WorkItem> => result.status === 'fulfilled')
          .map((result) => result.value);
        const failedCount = results.length - resolvedItems.length;

        if (!isMounted) return;
        setWorkItems(resolvedItems);
        setLoadError(
          failedCount > 0
            ? `${failedCount}개의 작업 상태를 불러오지 못했습니다. 응답 가능한 작업만 표시합니다.`
            : '',
        );
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error instanceof Error ? error.message : '작업 상태를 불러오지 못했습니다.');
        setWorkItems([]);
      } finally {
        isPolling = false;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadJobs();
    const polling = window.setInterval(() => {
      void loadJobs();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(polling);
    };
  }, []);

  const selectedWork = workItems.find((work) => expandedWorkIds.includes(work.id)) ?? workItems[0];
  const progressPercent = selectedWork ? clampPercent(selectedWork.progressPercent) : 0;

  const toggleWork = (workId: string) => {
    setExpandedWorkIds((current) =>
      current.includes(workId) ? current.filter((id) => id !== workId) : [...current, workId],
    );
  };

  const handleDeleteWork = (workId: string) => {
    removeStoredGenerationJob(Number(workId));
    setWorkItems((current) => current.filter((work) => work.id !== workId));
    setExpandedWorkIds((current) => current.filter((id) => id !== workId));
  };

  return (
    <div className="myWorksPage">
      <Header variant="home" activeNav="my" />
      <main className="myWorksPage__main">
        <section className="myWorksPage__title">
          <h1>작업 중인 폰트</h1>
          <span>
            <i />
            총 {workItems.length}개 작업
          </span>
        </section>

        {isLoading ? (
          <WorkListStatus title="작업을 불러오는 중" body="작업 목록과 진행 로그를 준비하고 있습니다." />
        ) : loadError && workItems.length === 0 ? (
          <WorkListStatus title="작업을 불러오지 못했습니다" body={loadError} />
        ) : workItems.length === 0 ? (
          <WorkListStatus
            title="진행 중인 작업이 없습니다"
            body="새로운 영문 폰트를 선택해 한글 폰트 생성 작업을 시작해 보세요."
          />
        ) : (
          <div className="myWorksPage__layout">
            <div className="myWorksPage__left">
              {loadError ? <WorkListStatus title="일부 작업만 표시 중입니다" body={loadError} /> : null}
              {workItems.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  expanded={expandedWorkIds.includes(work.id)}
                  onToggle={() => toggleWork(work.id)}
                  onDelete={() => handleDeleteWork(work.id)}
                />
              ))}
            </div>
            <AlgorithmPanel progressPercent={progressPercent} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
