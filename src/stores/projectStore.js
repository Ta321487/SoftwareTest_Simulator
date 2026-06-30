import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '../utils/storage'
import { scheduleAutoBackup } from '../utils/autoBackup'

const STORAGE_KEY = 'project_artifacts'
const LOGIN_SUT_KEY = 'project_sut'
const PAYMENT_SUT_KEY = 'payment_sut'
const ORDER_SUT_KEY = 'order_sut'
const ONBOARD_SUT_KEY = 'onboard_sut'
const LEAD_SUT_KEY = 'lead_sut'

export const useProjectStore = defineStore('project', {
  state: () => ({
    artifacts: getItem(STORAGE_KEY, {}),
    loginSut: getItem(LOGIN_SUT_KEY, {}),
    paymentSut: getItem(PAYMENT_SUT_KEY, {}),
    orderSut: getItem(ORDER_SUT_KEY, {}),
    onboardSut: getItem(ONBOARD_SUT_KEY, {}),
    leadSut: getItem(LEAD_SUT_KEY, {}),
  }),

  getters: {
    getArtifact: (state) => (projectId, levelId) => {
      return state.artifacts[projectId]?.[levelId] ?? null
    },

    hasArtifact: (state) => (projectId, levelId) => {
      return Boolean(state.artifacts[projectId]?.[levelId])
    },
  },

  actions: {
    saveArtifact(projectId, levelId, data) {
      if (!this.artifacts[projectId]) {
        this.artifacts[projectId] = {}
      }
      this.artifacts[projectId][levelId] = data
      this.persist()
    },

    clearProject(projectId) {
      if (this.artifacts[projectId]) {
        delete this.artifacts[projectId]
        this.persist()
      }
    },

    getLoginSut(projectId) {
      return this.loginSut[projectId] || {}
    },

    patchLoginSut(projectId, patch) {
      this.loginSut[projectId] = { ...this.getLoginSut(projectId), ...patch }
      this._persistSut(LOGIN_SUT_KEY, this.loginSut)
    },

    getPaymentSut(projectId) {
      return this.paymentSut[projectId] || {}
    },

    patchPaymentSut(projectId, patch) {
      this.paymentSut[projectId] = { ...this.getPaymentSut(projectId), ...patch }
      this._persistSut(PAYMENT_SUT_KEY, this.paymentSut)
    },

    getOrderSut(projectId) {
      return this.orderSut[projectId] || {}
    },

    patchOrderSut(projectId, patch) {
      this.orderSut[projectId] = { ...this.getOrderSut(projectId), ...patch }
      this._persistSut(ORDER_SUT_KEY, this.orderSut)
    },

    getOnboardSut(projectId) {
      return this.onboardSut[projectId] || {}
    },

    patchOnboardSut(projectId, patch) {
      this.onboardSut[projectId] = { ...this.getOnboardSut(projectId), ...patch }
      this._persistSut(ONBOARD_SUT_KEY, this.onboardSut)
    },

    getLeadSut(projectId) {
      return this.leadSut[projectId] || {}
    },

    patchLeadSut(projectId, patch) {
      this.leadSut[projectId] = { ...this.getLeadSut(projectId), ...patch }
      this._persistSut(LEAD_SUT_KEY, this.leadSut)
    },

    importSnapshot(data) {
      this.artifacts = data.artifacts || {}
      this.loginSut = data.loginSut || {}
      this.paymentSut = data.paymentSut || {}
      this.orderSut = data.orderSut || {}
      this.onboardSut = data.onboardSut || {}
      this.leadSut = data.leadSut || {}
      this._persistSut(STORAGE_KEY, this.artifacts)
      this._persistSut(LOGIN_SUT_KEY, this.loginSut)
      this._persistSut(PAYMENT_SUT_KEY, this.paymentSut)
      this._persistSut(ORDER_SUT_KEY, this.orderSut)
      this._persistSut(ONBOARD_SUT_KEY, this.onboardSut)
      this._persistSut(LEAD_SUT_KEY, this.leadSut)
    },

    _persistSut(key, value) {
      const result = setItem(key, value)
      if (result.ok) scheduleAutoBackup()
      return result
    },

    resetAll() {
      this.artifacts = {}
      this.loginSut = {}
      this.paymentSut = {}
      this.orderSut = {}
      this.onboardSut = {}
      this.leadSut = {}
      removeItem(STORAGE_KEY)
      removeItem(LOGIN_SUT_KEY)
      removeItem(PAYMENT_SUT_KEY)
      removeItem(ORDER_SUT_KEY)
      removeItem(ONBOARD_SUT_KEY)
      removeItem(LEAD_SUT_KEY)
    },

    persist() {
      this._persistSut(STORAGE_KEY, this.artifacts)
    },
  },
})
