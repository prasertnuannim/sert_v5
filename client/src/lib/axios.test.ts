import { beforeEach, describe, expect, it } from 'vitest'
import { accessTokenStore } from './axios'

describe('access token store', () => {
  beforeEach(() => accessTokenStore.clear())

  it('keeps the access token in memory and clears it', () => {
    accessTokenStore.set('access-token')
    expect(accessTokenStore.get()).toBe('access-token')

    accessTokenStore.clear()
    expect(accessTokenStore.get()).toBeNull()
  })
})
