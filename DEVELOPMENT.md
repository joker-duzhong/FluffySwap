# 开发规范

## 架构分层

```
src/
├── api/              # API 层：封装后端接口
├── stores/           # 状态层：Pinia 状态管理
├── services/         # 业务层：复杂业务逻辑
├── utils/            # 工具层：纯函数工具
├── components/       # 组件层：UI 组件
└── pages/            # 视图层：页面
```

## 核心原则

### 1. 请求层 (api/)
- 所有后端请求必须通过 `http` 实例
- 按业务模块创建服务类（如 `auth.ts`, `user.ts`）
- 定义清晰的请求/响应类型

```typescript
// src/api/example.ts
import { http } from './base';

export interface ExampleData {
  id: string;
  name: string;
}

class ExampleService {
  async getList(): Promise<ExampleData[]> {
    return http.request<ExampleData[]>({
      url: '/api/v1/examples',
      method: 'GET',
      needAuth: true,
    });
  }
}

export const exampleService = new ExampleService();
```

### 2. 状态层 (stores/)
- 使用 Pinia 管理全局状态
- 一个 store 对应一个业务域
- 只存储需要跨组件共享的状态

```typescript
// src/stores/exampleStore.ts
import { defineStore } from 'pinia';

export const useExampleStore = defineStore('example', {
  state: () => ({
    list: [] as ExampleData[],
  }),
  actions: {
    setList(data: ExampleData[]) {
      this.list = data;
    },
  },
});
```

### 3. 视图层 (pages/components/)
- 组件只负责 UI 渲染和用户交互
- 通过 API 层获取数据，通过 Store 管理状态
- 避免在组件中写复杂业务逻辑

```vue
<script setup lang="ts">
import { exampleService } from '@/api/example';
import { useExampleStore } from '@/stores/exampleStore';

const store = useExampleStore();

const loadData = async () => {
  const data = await exampleService.getList();
  store.setList(data);
};
</script>
```

## 命名规范

- **文件名**：小驼峰 `exampleService.ts`
- **类名**：大驼峰 `ExampleService`
- **变量/函数**：小驼峰 `getUserInfo`
- **常量**：大写下划线 `API_BASE_URL`
- **类型/接口**：大驼峰 `UserInfo`

## 类型定义

- 所有 API 请求/响应必须定义类型
- 优先使用 `interface` 而非 `type`
- 类型定义放在使用它的文件顶部

## 错误处理

- API 层统一处理 HTTP 错误
- 业务错误在调用处用 try-catch 处理
- 用户可感知的错误用 `uni.showToast` 提示

## 禁止事项

❌ 不要在组件中直接使用 `uni.request`  
❌ 不要在 API 层写业务逻辑  
❌ 不要在 Store 中调用 API（在组件/页面中调用）  
❌ 不要创建不必要的中间层和抽象
