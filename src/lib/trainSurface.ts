import { bankGenerator, type BankQuestion } from './bank'
import { SURFACE_BANK } from '../data/practice/surface'

export type SurfaceData = BankQuestion

export const generateSurface = bankGenerator<BankQuestion>(SURFACE_BANK)
