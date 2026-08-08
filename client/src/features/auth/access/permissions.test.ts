import { describe, expect, it } from 'vitest'
import { hasPermission } from './permissions'

describe('role permissions', () => {
  it('keeps viewer access read-only', () => {
    expect(hasPermission('viewer', 'devices:read')).toBe(true)
    expect(hasPermission('viewer', 'devices:control')).toBe(false)
    expect(hasPermission('viewer', 'users:manage')).toBe(false)
  })

  it('grants user administration only to administrators', () => {
    expect(hasPermission('admin', 'users:manage')).toBe(true)
    expect(hasPermission('engineer', 'users:manage')).toBe(false)
    expect(hasPermission(undefined, 'users:manage')).toBe(false)
  })
})
