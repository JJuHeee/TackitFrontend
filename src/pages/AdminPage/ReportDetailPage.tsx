import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import Modal from '../../components/modals/Modal'
import { toastSuccess, toastError } from '../../utils/toast'
import { toReportPostTypePath } from '../../utils/adminReport'

type ReportReasonEnum =
  | 'ADVERTISEMENT'
  | 'DUPLICATE'
  | 'FALSE_INFO'
  | 'IRRELEVANT'
  | 'ETC'

type DetailResp = {
  targetId: number
  targetType: 'FREE_POST' | 'QNA_POST' | 'TIP_POST' | string
  postType: 'FREE' | 'QNA' | 'TIP' | string
  contentTitle: string
  contentWriter: string
  status: 'ACTIVE' | 'DISABLED' | 'DELETED' | string
  reportLogs: Array<{
    reportId: number
    reporterNickname: string
    reportReason: ReportReasonEnum
    createdAt: string
  }>
}

// 백엔드 코드 → 한글
function reasonCodeToText(code: string): string {
  switch (code) {
    case 'ADVERTISEMENT':
      return '광고 및 홍보성 게시물'
    case 'DUPLICATE':
      return '중복 또는 도배성 게시물'
    case 'FALSE_INFO':
      return '허위 정보 또는 사실 왜곡'
    case 'IRRELEVANT':
      return '게시판 주제와 관련 없는 내용'
    case 'ETC':
      return '기타'
    default:
      return '기타'
  }
}

export default function ReportReasonDetailPage() {
  // ✅ 라우트: /admin/reports/:targetType/:targetId 에 맞게 파라미터 2개 받기
  const { targetId, targetType } = useParams<{
    targetId: string
    targetType: string
  }>()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<DetailResp | null>(null)
  const [activating, setActivating] = React.useState(false)
  const [restoreOpen, setRestoreOpen] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    // 🔐 targetId 또는 targetType이 없으면 바로 에러 처리
    if (!targetId || !targetType) {
      setError('잘못된 접근입니다. (필수 파라미터 누락)')
      setLoading(false)
      return
    }

    ;(async () => {
      try {
        setLoading(true)
        setError(null)

        const { data } = await api.get<DetailResp>(
          `/api/admin/dashboard/reports/${targetId}`,
          {
            params: {
              targetType, // 예: "TIP_POST"
            },
          }
        )

        if (!mounted) return
        setData(data)
      } catch (e: any) {
        if (!mounted) return
        const msg =
          e?.response?.data?.message ||
          e?.message ||
          '신고사유 상세 조회 중 오류가 발생했습니다.'
        setError(msg)
        toastError(msg)
      } finally {
        if (mounted) setLoading(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [targetId, targetType])

  const latestLog = React.useMemo(() => {
    if (!data?.reportLogs?.length) return null
    return [...data.reportLogs].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    )[0]
  }, [data])

  const reportCount = data?.reportLogs?.length ?? 0
  const showRestore = data && reportCount >= 3 && data.status !== 'ACTIVE'

  const statusBadge = (() => {
    if (!data) return ''
    if (data.status === 'ACTIVE') {
      if (reportCount <= 2) return `신고 ${reportCount}회`
      return '활성화'
    }
    if (data.status === 'DISABLED') return '비활성화'
    if (data.status === 'DELETED') return '삭제됨'
    return data.status
  })()

  const badgeClass =
    data?.status === 'ACTIVE'
      ? 'bg-[var(--background-neutral)] text-[var(--label-normal)]'
      : data?.status === 'DISABLED'
      ? 'bg-[var(--background-red)] text-[var(--label-danger)]'
      : 'bg-[var(--background-neutral)] text-[var(--label-normal)]'

  const handleActivate = async (): Promise<boolean> => {
    if (!data) return false

    const postTypePath = toReportPostTypePath(data.postType)
    if (!postTypePath) {
      toastError(`알 수 없는 게시판 타입입니다: ${data.postType}`)
      return false
    }

    try {
      setActivating(true)

      await api.patch(
        `/api/admin/report/${postTypePath}/posts/${data.targetId}/activate`
      )

      setData((prev) => (prev ? { ...prev, status: 'ACTIVE' } : prev))
      toastSuccess('게시글이 복구되었습니다.')
      return true
    } catch (e: any) {
      const msg =
        e?.response?.data?.message || '활성화 처리 중 오류가 발생했습니다.'
      toastError(msg)
      return false
    } finally {
      setActivating(false)
    }
  }

  return (
    <AdminLayout>
      <div className="px-[36px] py-[32px]">
        <div className="mb-[32px]">
          <button
            onClick={() => navigate('/admin/reports')}
            className="rounded-xl hover:bg-[var(--background-neutral)]"
            aria-label="뒤로가기"
          >
            <img
              src="/assets/icons/arrow-left.svg"
              alt="뒤로가기"
              className="w-[32px] h-[32px]"
            />
          </button>
        </div>

        {loading && (
          <div className="mx-auto max-w-[960px] bg-white rounded-2xl ring-1 ring-[var(--line-normal)] p-8">
            불러오는 중…
          </div>
        )}
        {error && (
          <div className="mx-auto max-w-[960px] bg-white rounded-2xl ring-1 ring-[var(--line-normal)] p-8 text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <section
            className="
              w-[1086px] h-[504px]
              bg-white rounded-[12px]
              px-[24px] py-[32px]
            "
          >
            <h2 className="text-center mb-[32px] text-[var(--label-normal)] text-title-2b">
              상세 정보
            </h2>

            <dl className="px-[12px] space-y-[8px]">
              <InfoLine
                term="유형"
                desc={humanizeTargetType(data.targetType)}
              />
              <InfoLine term="위치" desc={humanizePostType(data.postType)} />
              <InfoLine
                term="신고 내용"
                desc={<span className="break-all">{data.contentTitle}</span>}
              />
              <InfoLine
                term="신고 사유"
                desc={
                  latestLog ? reasonCodeToText(latestLog.reportReason) : '-'
                }
              />
              <InfoLine term="작성자" desc={data.contentWriter} />
              <InfoLine
                term="신고자"
                desc={latestLog?.reporterNickname || '-'}
              />
              <InfoLine
                term="상태"
                desc={
                  <span
                    className={`inline-block px-[8px] py-[4px] rounded-[8px] text-[14px] ${badgeClass}`}
                  >
                    {statusBadge}
                  </span>
                }
              />
              <InfoLine
                term="신고 일자"
                desc={latestLog ? formatKSTPretty(latestLog.createdAt) : '-'}
              />
            </dl>

            {showRestore && (
              <div className="mt-10">
                <button
                  onClick={() => setRestoreOpen(true)}
                  disabled={activating}
                  className="
                    w-full
                    px-[16px] py-[12px]
                    rounded-[12px]
                    border border-[var(--line-normal)]
                    hover:bg-[var(--background-neutral)]
                    text-center
                    disabled:opacity-60
                  "
                >
                  복구
                </button>
              </div>
            )}
          </section>
        )}
      </div>

      <Modal
        open={restoreOpen}
        title="게시글을 복구하시겠습니까?"
        confirmText="네"
        cancelText="취소"
        onCancel={() => setRestoreOpen(false)}
        onConfirm={async () => {
          const ok = await handleActivate()
          if (ok) {
            setRestoreOpen(false)
          }
        }}
      />
    </AdminLayout>
  )
}

function humanizeTargetType(t: string) {
  const upper = t.toUpperCase()
  if (upper.includes('COMMENT')) return '댓글'
  if (upper.includes('POST')) return '게시글'
  return t
}

function humanizePostType(t: string) {
  if (t === 'FREE') return '다같이 얘기해요'
  if (t === 'QNA') return '신입이 질문해요'
  if (t === 'TIP') return '선배가 알려줘요'
  return t
}

function formatKSTPretty(iso: string) {
  try {
    const d = new Date(iso)
    const parts = new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).formatToParts(d)

    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value || ''
    const yyyy = get('year')
    const mm = get('month').padStart(2, '0')
    const dd = get('day').padStart(2, '0')
    const dayPeriod = get('dayPeriod') // 오전/오후
    const hour = get('hour')
    const minute = get('minute')
    return `${yyyy}.${mm}.${dd} ${dayPeriod} ${hour}:${minute}`
  } catch {
    return iso
  }
}

function InfoLine({ term, desc }: { term: string; desc: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[12px]">
      <dt className="w-[72px] shrink-0 text-body-1 text-[var(--label-neutral)]">
        {term}
      </dt>
      <span className="text-[var(--line-normal)]">|</span>
      <dd className="text-body-1 text-[var(--label-normal)]">{desc}</dd>
    </div>
  )
}
