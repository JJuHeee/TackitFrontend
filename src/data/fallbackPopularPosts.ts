// src/data/fallbackPopularPosts.ts
import type { PopularPost } from '../components/posts/PopularPostCard'

export const fallbackPopularPosts: PopularPost[] = [
  {
    id: 1,
    writer: '눈송',
    profileImageUrl: null,
    title: '신입이 많이 하는 실수 3가지',
    content:
      '회사 첫 출근부터 알아두면 좋은 기본 예절과 커뮤니케이션 팁을 정리했어요.',
    createdAt: '2025-10-20T10:00:00',
    type: 'TIP_POST',
    viewCount: 120,
    scrapCount: 15,
  },
  {
    id: 2,
    writer: '스누',
    profileImageUrl: null,
    title: '개발자 포트폴리오 구성 꿀팁',
    content: '실제 현직자가 알려주는 포트폴리오 작성 노하우와 주의해야 할 점!',
    createdAt: '2025-10-18T09:30:00',
    type: 'FREE_POST',
    viewCount: 87,
    scrapCount: 8,
  },
  {
    id: 3,
    writer: '송이',
    profileImageUrl: null,
    title: '처음 코드리뷰 받을 때 대처법',
    content:
      '리뷰 코멘트에 상처받지 않고 성장 기회로 바꾸는 방법을 공유합니다.',
    createdAt: '2025-10-17T12:45:00',
    type: 'QNA_POST',
    viewCount: 65,
    scrapCount: 5,
  },
]
