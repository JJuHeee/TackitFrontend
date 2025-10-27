import * as React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from './layout/AdminLayout'
import api from '../../api/api'
import Modal from '../../components/modals/Modal'
import { toastSuccess, toastWarn, toastError } from '../../utils/toast'

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

const listFallback = [
  {
    id: 1,
    type: 'POST' as const,
    content: '신입사원을 위한 회사생활 꿀팁',
    reason: '허위 정보 또는 사실 왜곡',
    status: 'DISABLED' as const,
    count: 3,
    createdAt: '2025-06-20',
  },
  {
    id: 2,
    type: 'COMMENT' as const,
    content: '신규 고객사 대상 세일즈 전략 관련 질문드립니다',
    reason: '허위 정보 또는 사실 왜곡',
    status: 'RECEIVED' as const,
    count: 2,
    createdAt: '2025-06-20',
  },
]

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

// 🔧 한글 → enum (fallback 생성용)
function korReasonToEnum(kor: string): ReportReasonEnum {
  const s = kor.trim()
  if (s.includes('광고')) return 'ADVERTISEMENT'
  if (s.includes('중복') || s.includes('도배')) return 'DUPLICATE'
  if (s.includes('허위') || s.includes('왜곡')) return 'FALSE_INFO'
  if (s.includes('관련 없') || s.includes('무관') || s.includes('주제'))
    return 'IRRELEVANT'
  return 'ETC'
}

// 목록 fallback → 상세 fallback으로 변환
function toDetailFallback(item: (typeof listFallback)[number]): DetailResp {
  let postType: 'FREE' | 'QNA' | 'TIP' = 'FREE'
  if (item.content.includes('꿀팁')) postType = 'TIP'
  if (item.content.includes('질문')) postType = 'QNA'

  const statusMap: Record<string, 'ACTIVE' | 'DISABLED' | 'DELETED'> = {
    DISABLED: 'DISABLED',
    RECEIVED: 'ACTIVE',
  }
  const status = statusMap[item.status] ?? 'ACTIVE'

  const logs: DetailResp['reportLogs'] = Array.from({ length: item.count }).map(
    (_, idx) => {
      const base = new Date(item.createdAt)
      base.setHours(10 - idx)
      return {
        reportId: Number(`${item.id}${idx + 1}`),
        reporterNickname: `신고자${idx + 1}`,
        reportReason: korReasonToEnum(item.reason),
        createdAt: base.toISOString(),
      }
    }
  )

  const targetType =
    item.type === 'COMMENT'
      ? postType === 'TIP'
        ? 'TIP_COMMENT'
        : postType === 'QNA'
        ? 'QNA_COMMENT'
        : 'FREE_COMMENT'
      : postType === 'TIP'
      ? 'TIP_POST'
      : postType === 'QNA'
      ? 'QNA_POST'
      : 'FREE_POST'

  return {
    targetId: item.id,
    targetType,
    postType,
    contentTitle: item.content,
    contentWriter: postType === 'TIP' ? '작성자1' : '알 수 없음',
    status,
    reportLogs: logs,
  }
}

const fallbackDetailById: Record<number, DetailResp> = Object.fromEntries(
  listFallback.map((it) => [it.id, toDetailFallback(it)])
)

export default function ReportReasonDetailPage() {
  const { targetId } = useParams<{ targetId: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<DetailResp | null>(null)
  const [activating, setActivating] = React.useState(false)
  const [restoreOpen, setRestoreOpen] = React.useState(false)

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const { data } = await api.get<DetailResp>(
          `/api/admin/dashboard/reports/${targetId}`
        )
        if (!mounted) return
        setData(data)
      } catch (e: any) {
        if (!mounted) return
        const idNum = Number(targetId)
        const fb = fallbackDetailById[idNum]
        if (fb) {
          setData(fb)
          // 네트워크 실패 등으로 폴백 사용됨을 알림 (선택)
          toastWarn?.('네트워크 오류로 임시 데이터(폴백)를 표시합니다.')
        } else {
          const msg =
            e?.response?.data?.message ||
            e?.message ||
            '신고사유 상세 조회 중 오류가 발생했습니다.'
          setError(msg)
          toastError(msg)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [targetId])

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

  const isComment =
    !!data?.targetType && data.targetType.toUpperCase().includes('COMMENT')

  const handleActivate = async (): Promise<boolean> => {
    if (!data) return false
    try {
      setActivating(true)
      await api.patch(
        `/api/admin/report/${data.postType}/posts/${data.targetId}/activate`
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

function InfoRow({ term, desc }: { term: string; desc: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <dt className="w-[56px] shrink-0 text-[var(--label-assistive)]">
        {term}
      </dt>
      <span className="text-[var(--line-normal)]">|</span>
      <dd className="flex-1 pl-1">{desc}</dd>
    </div>
  )
}

function humanizeTargetType(t: string) {
  const upper = t.toUpperCase()
  if (upper.includes('COMMENT')) return '댓글'
  if (upper.includes('POST')) return '게시글'
  return t
}

function humanizePostType(t: string) {
  if (t === 'FREE') return '자유롭게 얘기해요'
  if (t === 'QNA') return '신입이 질문해요'
  if (t === 'TIP') return '선배가 알려줘요'
  return t
}

/** 2025.06.20 오후 9:18 형태 */
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

function getPostDetailPath(postType: string, postId: number) {
  if (postType === 'FREE') return `/free/${postId}`
  if (postType === 'QNA') return `/qna/${postId}`
  if (postType === 'TIP') return `/tip/${postId}`
  return ''
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
