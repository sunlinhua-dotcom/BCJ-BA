export const PRODUCTS = [
    {
        id: 'cream',
        name: '仙草霜',
        sub: '年轻嘭弹',
        image: '/products/cream.webp',
        description: '5大仙草入霜，促生紧实胶原'
    },
    {
        id: 'water',
        name: '仙草露',
        sub: '细腻柔光',
        image: '/products/water.webp',
        description: '16万仙草油啵啵，透老醇萃98.7%'
    },
    {
        id: 'oil',
        name: '仙草油',
        sub: '紧透生光',
        image: '/products/oil.webp',
        description: '60%高浓仙草油，99%天然植萃油'
    },
    {
        id: 'lotion',
        name: '仙草乳',
        sub: '紧透弹嫩',
        image: '/products/lotion.webp',
        description: '5大仙草组方，专利微囊包裹'
    }
]

// ─── 角色定义 ──────────────────────────────────────────────────────────────
export type UserRole = 'BA' | 'KOC'

export const ROLES = [
    {
        id: 'BA' as UserRole,
        name: '美容顾问',
        nameEn: 'Beauty Advisor',
        desc: '朋友圈外宣 · 客情维护',
        icon: 'ba',
    },
    {
        id: 'KOC' as UserRole,
        name: '种草达人',
        nameEn: 'Key Opinion Consumer',
        desc: '精准种草 · 平台爆文',
        icon: 'koc',
    },
]

// ─── KOC 精准标签 ───────────────────────────────────────────────────────────
export const KOC_SKIN_TYPES = [
    { id: 'dry', label: '干皮' },
    { id: 'oily', label: '油皮' },
    { id: 'combo', label: '混合皮' },
    { id: 'sensitive', label: '敏感肌' },
]

export const KOC_AGE_GROUPS = [
    { id: '20-25', label: '20-25岁' },
    { id: '26-30', label: '26-30岁' },
    { id: '31-35', label: '31-35岁' },
    { id: '35+', label: '35岁以上' },
]

export const KOC_SCENES = [
    { id: 'daily', label: '日常护肤' },
    { id: 'seasonal', label: '换季修护' },
    { id: 'travel', label: '出行旅行' },
    { id: 'bedtime', label: '睡前护理' },
]

// ─── 文案标签（按角色区分） ──────────────────────────────────────────────────
export const COPY_STYLE_LABELS: Record<UserRole, { styleA: string; styleB: string; styleC: string }> = {
    BA: {
        styleA: '朋友圈种草',
        styleB: '客情维护',
        styleC: '专业测评',
    },
    KOC: {
        styleA: '小红书爆文',
        styleB: '闺蜜分享',
        styleC: '精准种草',
    },
}
