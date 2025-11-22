import * as React from 'react'
import { SectionTitle } from './SectionTitle'
import { FixedStatCard } from './FixedStatCard'

type Props = {
  deletedMembersCount: number
  deletedCount: number
  onClickUsers: () => void
  onClickReports: () => void
}

/** 오른쪽 > 버튼 */
function ChevronRightBtn({
  onClick,
  ariaLabel,
}: {
  onClick: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="
        absolute right-[16px] top-1/2 -translate-y-1/2
        grid place-items-center w-[28px] h-[28px]
        rounded-full hover:bg-[var(--background-neutral)]
        focus:outline-none
      "
    >
      <img
        src="/assets/icons/arrow-right.svg"
        alt="이동"
        className="w-[18px] h-[18px]"
      />
    </button>
  )
}

/** 말풍선 */
function BubbleTip({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  if (!open) return null
  return (
    <div
      className="
        absolute bottom-[36px] left-1/2 -translate-x-1/2
        z-50
        rounded-[8px] px-[12px] py-[8px]
        flex items-center justify-center text-center
        shadow-[0_4px_12px_rgba(0,0,0,0.1)]
      "
      style={{
        width: 'max-content',
        maxWidth: 420,
        backgroundColor: 'var(--background-active)',
        color: 'var(--label-inverse)',
      }}
    >
      <span className="text-[14px] leading-[20px] font-medium">{children}</span>
      <div
        className="
          absolute -bottom-[6px] left-1/2 -translate-x-1/2
          w-0 h-0
          border-x-[6px] border-x-transparent border-t-[6px]
        "
        style={{ borderTopColor: 'var(--background-active)' }}
      />
    </div>
  )
}

export function DashboardIssueSection({
  deletedMembersCount,
  deletedCount,
  onClickUsers,
  onClickReports,
}: Props) {
  const [warnOpen, setWarnOpen] = React.useState(false)

  return (
    <>
      <SectionTitle>주의/이슈 영역</SectionTitle>
      <div className="ml-[36px] mb-[32px] flex gap-[24px] flex-wrap">
        {/* 탈퇴 계정 카드 */}
        <div className="relative">
          <FixedStatCard
            className="w-[533px] h-[112px]"
            title="탈퇴 계정"
            value={deletedMembersCount.toLocaleString()}
            suffix="개"
            iconSrc="/icons/admin/withdrawn-users.svg"
          />

          <ChevronRightBtn
            onClick={onClickUsers}
            ariaLabel="사용자 관리 페이지로 이동"
          />
        </div>

        {/* 삭제 게시글/댓글 카드 */}
        <div className="relative">
          <FixedStatCard
            className="w-[533px] h-[112px]"
            title="삭제 게시글/댓글"
            value={deletedCount.toLocaleString()}
            suffix="개"
            iconSrc="/icons/admin/deleted-posts.svg"
            rightExtra={
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setWarnOpen((v) => !v)}
                  className="p-[6px] rounded-[8px] hover:bg-[var(--background-neutral)]"
                >
                  <img
                    src="/warning.svg"
                    className="w-[20px] h-[20px]"
                    alt="주의"
                  />
                </button>
                <BubbleTip open={warnOpen}>
                  신고 3회 누적 시 게시글은 비활성화되며, 댓글은 자동으로
                  삭제됩니다.
                </BubbleTip>
              </div>
            }
          />

          <ChevronRightBtn
            onClick={onClickReports}
            ariaLabel="신고 관리 페이지로 이동"
          />
        </div>
      </div>
    </>
  )
}
