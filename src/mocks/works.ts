import type { WorkItem } from '../types/work';

export const previewLetters = ['가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하'];

export const mockWorkItems: WorkItem[] = [
  {
    id: 'neo-modernist-sans',
    title: 'Neo-Modernist Sans',
    updatedAt: '최근 업데이트: 12분 전',
    progressPercent: 62,
    phase: 'retraining',
    statusLabel: 'IN PROGRESS',
    sample: 'Aa',
    previewLetters,
    logs: [
      {
        id: 'neo-log-1',
        time: '14:08',
        title: '영문 스타일 분석 완료',
        detail: '획 두께, 곡률, 세리프 특징 128개 파라미터 추출이 완료되었습니다.',
        state: 'done',
      },
      {
        id: 'neo-log-2',
        time: '14:16',
        title: 'AI 재학습 진행 중',
        detail: '기초 자소 14자를 기반으로 2,350자 전체 글자셋의 스타일 일관성을 학습하고 있습니다.',
        state: 'active',
      },
      {
        id: 'neo-log-3',
        time: '대기',
        title: '2,350자 완성 대기',
        detail: '재학습이 완료되면 TTF 파일 생성을 위한 최종 빌드가 시작됩니다.',
        state: 'waiting',
      },
    ],
  },
  {
    id: 'organic-script-c12',
    title: 'Organic Script C12',
    updatedAt: '대기 중: 예상 소요 42분',
    progressPercent: 7,
    phase: 'queued',
    statusLabel: 'QUEUED',
    queueLabel: 'STAGE 01',
    sample: 'Aa',
    logs: [
      {
        id: 'organic-log-1',
        time: '13:54',
        title: '작업 요청 접수',
        detail: '업로드된 영문 서체 파일 검증을 완료하고 분석 큐에 등록했습니다.',
        state: 'done',
      },
      {
        id: 'organic-log-2',
        time: '대기',
        title: '영문 스타일 분석 대기',
        detail: '이전 작업이 완료되면 자동으로 스타일 분석이 시작됩니다.',
        state: 'waiting',
      },
    ],
  },
];
