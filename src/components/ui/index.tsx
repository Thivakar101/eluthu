import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { motion } from 'framer-motion'
export function Button({ children, kind = 'secondary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { kind?: 'primary' | 'secondary' | 'ghost'; children: ReactNode }) { return <button className={`button button-${kind} ${className}`} {...props}>{children}</button> }
export function IconButton({ label, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) { return <button className="icon-button" aria-label={label} title={label} {...props}>{children}</button> }
export function Field({ label, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="field"><span>{label}</span><input {...props}/></label> }
export function Page({ children, className = '' }: { children: ReactNode; className?: string }) { return <motion.main className={`page ${className}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .3 }}>{children}</motion.main> }
export function SectionLabel({ children }: { children: ReactNode }) { return <span className="section-label">{children}</span> }
