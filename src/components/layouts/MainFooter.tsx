import React from 'react'

const MainFooter: React.FC = () => {
  return (
    <footer className="h-[164px] text-sm bg-white">
      <div className="w-full h-full flex flex-col items-start justify-start space-y-4 pt-[40px] pl-[170px]">
        <div className="flex flex-wrap items-center justify-start space-x-3 text-label-normal">
          <img src="/logo.svg" alt="Tackit" className="h-5 mr-2" />
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            className="text-body-1sb text-label-normal hover:underline"
          >
            서비스 소개
          </a>
          <span className="text-line-normal">|</span>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            className="text-body-1sb text-label-normal hover:underline"
          >
            고객센터
          </a>
          <span className="text-line-normal">|</span>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            className="text-body-1sb text-label-normal hover:underline"
          >
            자주 묻는 질문
          </a>
          <span className="text-line-normal">|</span>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            className="text-body-1sb text-label-normal hover:underline"
          >
            이용약관
          </a>
          <span className="text-line-normal">|</span>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a
            href="#"
            className="text-body-1sb text-label-normal hover:underline"
          >
            개인정보 처리방침
          </a>
        </div>

        <p className="text-xs text-label-neutral">
          ©Tackit. All rights reserved
        </p>
      </div>
    </footer>
  )
}

export default MainFooter
