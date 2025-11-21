import React from 'react'

const MainFooter: React.FC = () => {
  return (
    <footer className="h-[164px] text-sm bg-white">
      <div className="w-full h-full flex flex-col items-start justify-start space-y-4 pt-[40px] pl-[170px]">
        <div className="flex flex-wrap items-center justify-start space-x-3 text-label-normal">
          <img src="/logo.svg" alt="Tackit" className="h-5 mr-2" />

          <a
            href="https://torch-sumac-f0a.notion.site/tackit-2ae4589e7114809e9737ec7066950762?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-body-1sb text-label-normal hover:underline"
          >
            서비스 소개
          </a>

          <span className="text-line-normal">|</span>

          <a
            href="https://mail.google.com/mail/?view=cm&fs=1&to=contact.tackit@gmail.com"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-body-1sb text-label-normal hover:underline"
          >
            고객센터
          </a>

          <span className="text-line-normal">|</span>

          <a
            href="https://torch-sumac-f0a.notion.site/FAQ-2ae4589e7114800c98dcd712e675ca6f?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-body-1sb text-label-normal hover:underline"
          >
            자주 묻는 질문
          </a>

          <span className="text-line-normal">|</span>

          <a
            href="https://torch-sumac-f0a.notion.site/2b14589e7114802994dcf18395a0bfba?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-body-1sb text-label-normal hover:underline"
          >
            이용약관
          </a>

          <span className="text-line-normal">|</span>

          <a
            href="https://torch-sumac-f0a.notion.site/2b14589e711480ed84abcd45002f105b?source=copy_link"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-body-1sb text-label-normal hover:underline"
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
