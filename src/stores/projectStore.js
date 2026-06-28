import { defineStore } from 'pinia'
import { getItem, setItem, removeItem } from '../utils/storage'

const STORAGE_KEY = 'project_artifacts'
const LOGIN_SUT_KEY = 'project_sut'
const PAYMENT_SUT_KEY = 'payment_sut'
const ORDER_SUT_KEY = 'order_sut'
const ONBOARD_SUT_KEY = 'onboard_sut'

export const useProjectStore = defineStore('project', {
  state: () => ({
    artifacts: getItem(STORAGE_KEY, {}),
    loginSut: getItem(LOGIN_SUT_KEY, {}),
    paymentSut: getItem(PAYMENT_SUT_KEY, {}),
    orderSut: getItem(ORDER_SUT_KEY, {}),
    onboardSut: getItem(ONBOARD_SUT_KEY, {}),
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
      setItem(LOGIN_SUT_KEY, this.loginSut)
    },

    getPaymentSut(projectId) {
      return this.paymentSut[projectId] || {}
    },

    patchPaymentSut(projectId, patch) {
      this.paymentSut[projectId] = { ...this.getPaymentSut(projectId), ...patch }
      setItem(PAYMENT_SUT_KEY, this.paymentSut)
    },

    getOrderSut(projectId) {
      return this.orderSut[projectId] || {}
    },

    patchOrderSut(projectId, patch) {
      this.orderSut[projectId] = { ...this.getOrderSut(projectId), ...patch }
      setItem(ORDER_SUT_KEY, this.orderSut)
    },

    getOnboardSut(projectId) {
      return this.onboardSut[projectId] || {}
    },

    patchOnboardSut(projectId, patch) {
      this.onboardSut[projectId] = { ...this.getOnboardSut(projectId), ...patch }
      setItem(ONBOARD_SUT_KEY, this.onboardSut)
    },

    importSnapshot(data) {
      this.artifacts = data.artifacts || {}
      this.loginSut = data.loginSut || {}
      this.paymentSut = data.paymentSut || {}
      this.orderSut = data.orderSut || {}
      this.onboardSut = data.onboardSut || {}
      setItem(STORAGE_KEY, this.artifacts)
      setItem(LOGIN_SUT_KEY, this.loginSut)
      setItem(PAYMENT_SUT_KEY, this.paymentSut)
      setItem(ORDER_SUT_KEY, this.orderSut)
      setItem(ONBOARD_SUT_KEY, this.onboardSut)
    },

    resetAll() {
      this.artifacts = {}
      this.loginSut = {}
      this.paymentSut = {}
      this.orderSut = {}
      this.onboardSut = {}
      removeItem(STORAGE_KEY)
      removeItem(LOGIN_SUT_KEY)
      removeItem(PAYMENT_SUT_KEY)
      removeItem(ORDER_SUT_KEY)
      removeItem(ONBOARD_SUT_KEY)
    },

    persist() {
      setItem(STORAGE_KEY, this.artifacts)
    },
  },
})
