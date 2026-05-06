/**
 * 生图任务状态管理
 */
import { defineStore } from 'pinia'

export interface TaskOptions {
  models: Array<{
    model_id: string
    name: string
    cost: number
    is_vip_only?: boolean
  }>
  aspect_ratios: string[]
}

export interface GenerateTask {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  progress: number
  image_url?: string
  failed_reason?: string
  prompt: string
  model_name: string
  aspect_ratio: string
  cost: number
}

export const useTaskStore = defineStore('task', {
  state: () => ({
    // 创作参数
    prompt: '',
    selectedModel: '',
    selectedRatio: '1:1',

    // 任务选项
    options: null as TaskOptions | null,

    // 当前任务
    currentTask: null as GenerateTask | null,

    // 是否正在生成
    isGenerating: false,
  }),
  getters: {
    canGenerate: (state) => {
      return state.prompt.trim().length > 0 && state.selectedModel && !state.isGenerating
    },
    selectedModelInfo: (state) => {
      if (!state.options || !state.selectedModel) return null
      return state.options.models.find((m) => m.model_id === state.selectedModel)
    },
  },
  actions: {
    setPrompt(prompt: string) {
      this.prompt = prompt
    },
    setModel(modelId: string) {
      this.selectedModel = modelId
    },
    setRatio(ratio: string) {
      this.selectedRatio = ratio
    },
    applyPreset(prompt: string, ratio?: string, modelId?: string) {
      this.prompt = prompt
      if (ratio) this.selectedRatio = ratio
      if (modelId) this.selectedModel = modelId
    },
    setOptions(options: TaskOptions) {
      this.options = options
      // 默认选择第一个模型
      if (options.models.length > 0 && !this.selectedModel) {
        this.selectedModel = options.models[0].model_id
      }
      if (options.aspect_ratios.length > 0 && !options.aspect_ratios.includes(this.selectedRatio)) {
        this.selectedRatio = options.aspect_ratios[0]
      }
    },
    setCurrentTask(task: GenerateTask | null) {
      this.currentTask = task
    },
    updateTaskStatus(status: string, progress: number, imageUrl?: string, failedReason?: string) {
      if (this.currentTask) {
        this.currentTask.status = status as any
        this.currentTask.progress = progress
        if (imageUrl) this.currentTask.image_url = imageUrl
        if (failedReason) this.currentTask.failed_reason = failedReason
      }
    },
    startGenerating() {
      this.isGenerating = true
    },
    stopGenerating() {
      this.isGenerating = false
    },
    reset() {
      this.prompt = ''
      this.currentTask = null
      this.isGenerating = false
    },
  },
})
