'use client'
import { motion } from 'framer-motion'
import { UserRole, ROLES } from '@/lib/constants'

// BA 图标
const BAIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="4" width="32" height="32" rx="8" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M12 20h16M12 14h16M12 26h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="28" cy="26" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M28 23v-2M28 32v-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
)

// KOC 图标
const KOCIcon = () => (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="20,4 23.5,14 34,14 25.5,20.5 28.9,31 20,25 11.1,31 14.5,20.5 6,14 16.5,14"
            stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round"/>
    </svg>
)

interface RoleSelectorProps {
    selected: UserRole | null
    onSelect: (role: UserRole) => void
}

export default function RoleSelector({ selected, onSelect }: RoleSelectorProps) {
    return (
        <div className="role-selector">
            <p className="role-selector-label">我是</p>
            <div className="role-cards">
                {ROLES.map((role) => {
                    const isSelected = selected === role.id
                    return (
                        <motion.button
                            key={role.id}
                            className={`role-card ${isSelected ? 'role-card--selected' : ''}`}
                            onClick={() => onSelect(role.id)}
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            aria-pressed={isSelected}
                        >
                            {isSelected && (
                                <motion.span
                                    className="role-card__badge"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500 }}
                                >
                                    ✓
                                </motion.span>
                            )}
                            <div className="role-card__icon">
                                {role.id === 'BA' ? <BAIcon /> : <KOCIcon />}
                            </div>
                            <div className="role-card__body">
                                <span className="role-card__name">{role.name}</span>
                                <span className="role-card__en">{role.nameEn}</span>
                                <span className="role-card__desc">{role.desc}</span>
                            </div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
