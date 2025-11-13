import * as React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperClass } from 'swiper/types'
import { Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import { Button } from '../ui/Button'

type Slide = {
  title: string
  desc?: string
  img: string
  isLast?: boolean
}

const slides: Slide[] = [
  {
    title: '역할에 따라 글을 쓸 수 있는 게시판이 달라요',
    desc: '선배가 | 신입이 | 다같이\n(댓글은 어느 게시판이든 가능해요 🙂)',
    img: '/images/onboarding1.svg',
  },
  {
    title: '닉네임 옆에 역할에 따른 배지가 부여돼요🌱🌳',
    desc: '올해 신입이라면 내년부터는 자동으로 선배로 전환돼요\n(역할을 잘못 설정했다면 고객센터로 문의해주세요)',
    img: '/images/onboarding2.svg',
  },
  {
    title: 'tackit에 오신 걸 환영해요!',
    desc: '서로의 경험을 존중하며, 함께 배우고 성장하는 문화를 만들어가요.',
    img: '/images/onboarding3.svg',
    isLast: true,
  },
]

export default function OnboardingModal({
  onClose,
}: {
  onClose: (dontShowAgain: boolean) => void
}) {
  const swiperRef = React.useRef<SwiperClass | null>(null)

  React.useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  return (
    <div className="fixed inset-0 z-[1000] bg-black/40 grid place-items-center">
      <div
        className="
    relative w-[480px] h-[550px] pt-8
    bg-white rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.08)]
    overflow-hidden
  "
      >
        <button
          className="absolute top-[8px] right-[16px] p-1"
          onClick={() => {
            onClose(true)
          }}
          aria-label="닫기"
        >
          <img src="/icons/Close.svg" alt="" className="w-6 h-6" />
        </button>

        <div className="mb-4" />
        <div className="flex self-center justify-center gap-2 mt-2 mb-3 ob-pagination" />

        <Swiper
          modules={[Pagination]}
          slidesPerView={1}
          pagination={{ el: '.ob-pagination', clickable: true }}
          autoHeight={false}
          className="h-[calc(526px-8px-24px)] px-6"
          onSwiper={(sw: SwiperClass) => (swiperRef.current = sw)}
        >
          {slides.map((s, idx) => (
            <SwiperSlide key={idx} className="!h-full">
              {/* 세로 플렉스: 버튼을 아래로 밀기 위해 mt-auto 사용 */}
              <div className="flex flex-col items-center h-full text-center">
                <h2 className="mt-1 mb-3 whitespace-pre-line text-title-2b text-label-normal">
                  {s.title}
                </h2>

                {s.desc && (
                  <p className="mb-6 whitespace-pre-line text-body-2 text-label-neutral">
                    {s.desc}
                  </p>
                )}

                <div className="flex items-center justify-center min-h-0">
                  <img
                    src={s.img}
                    alt=""
                    className={
                      s.isLast
                        ? 'max-w-[392px] max-h-[284px] object-contain'
                        : 'max-w-[392px] max-h-[264px] object-contain'
                    }
                  />
                </div>

                <div className="w-full mt-6 mb-4">
                  {s.isLast ? (
                    <Button
                      size="m"
                      className="w-[392px] h-[48px]"
                      onClick={() => onClose(true)}
                    >
                      시작하기
                    </Button>
                  ) : (
                    <Button
                      size="m"
                      className="w-[392px] h-[48px]"
                      onClick={() => swiperRef.current?.slideNext()}
                    >
                      다음
                    </Button>
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  )
}
