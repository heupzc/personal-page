# TypeScript 高级类型体操

TypeScript 的类型系统是图灵完备的——这意味着你可以在类型层面完成任何计算。掌握高级类型技巧，不仅能让代码更安全，还能让 API 设计更优雅。

## 条件类型

条件类型是类型体操的基础，语法类似三目运算符：

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>;  // true
type B = IsString<42>;       // false
```

### 分发条件类型

当条件类型作用于联合类型时，会自动分发：

```typescript
type ToArray<T> = T extends unknown ? T[] : never;

type Result = ToArray<string | number>;
// 等价于 ToArray<string> | ToArray<number>
// 结果：string[] | number[]
```

> 如果不想分发，用 `[T]` 包裹：

```typescript
type ToArrayNoDist<T> = [T] extends [unknown] ? T[] : never;

type Result2 = ToArrayNoDist<string | number>;
// 结果：(string | number)[]
```

### infer 关键字

`infer` 用于在条件类型中"提取"类型：

```typescript
// 提取函数返回类型
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// 提取 Promise 内部类型
type Unpacked<T> = T extends Promise<infer U> ? U : T;

type P = Unpacked<Promise<string>>;  // string
```

## 映射类型

映射类型可以基于已有类型创建新类型：

```typescript
// 将所有属性变为只读
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

// 将所有属性变为可选
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

### 键的重映射 (TS 4.1+)

```typescript
// 去掉属性前缀
type RemovePrefix<T, P extends string> = {
  [K in keyof T as K extends `${P}${infer Rest}` ? Rest : K]: T[K];
};

interface ApiData {
  apiName: string;
  apiAge: number;
  realData: string;
}

type Cleaned = RemovePrefix<ApiData, 'api'>;
// { Name: string; Age: number; realData: string }
```

## 模板字面量类型

TS 4.1 引入的强大特性：

```typescript
type EventName<T extends string> = `on${Capitalize<T>}`;

type ClickEvent = EventName<'click'>;    // 'onClick'
type ChangeEvent = EventName<'change'>;  // 'onChange'

// CSS 属性类型
type CSSUnit = 'px' | 'em' | 'rem' | '%' | 'vh' | 'vw';
type CSSValue = `${number}${CSSUnit}`;

const width: CSSValue = '100px';   // ✅
const invalid: CSSValue = 'auto';  // ❌
```

## 递归类型

TypeScript 4.5 支持尾递归优化，让深层递归成为可能：

```typescript
// 深度 Readonly
type DeepReadonly<T> = T extends object
  ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
  : T;

// 深度 Partial
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T;

// 提取嵌套数组的元素类型
type Flatten<T> = T extends Array<infer U> ? Flatten<U> : T;

type Nested = string[][][][];
type Flat = Flatten<Nested>;  // string
```

## 实战：类型安全的事件系统

把上面的技巧组合起来，构建一个类型安全的事件总线：

```typescript
interface EventMap {
  'user:login': { userId: string; timestamp: number };
  'user:logout': { userId: string };
  'page:view': { path: string; referrer?: string };
}

class TypeSafeEventBus {
  private listeners: {
    [K in keyof EventMap]?: Array<(payload: EventMap[K]) => void>;
  } = {};

  on<E extends keyof EventMap>(
    event: E,
    callback: (payload: EventMap[E]) => void
  ): void {
    (this.listeners[event] ??= []).push(callback);
  }

  emit<E extends keyof EventMap>(
    event: E,
    payload: EventMap[E]
  ): void {
    this.listeners[event]?.forEach(cb => cb(payload));
  }
}

// 使用 — 完全类型安全
const bus = new TypeSafeEventBus();

bus.on('user:login', (payload) => {
  console.log(payload.userId);    // ✅ string
  console.log(payload.timestamp); // ✅ number
});

bus.emit('user:login', {
  userId: '123',
  timestamp: Date.now()
}); // ✅

bus.emit('user:login', {
  userId: '123'
  // ❌ 缺少 timestamp
});
```

## 总结

| 技巧 | 用途 |
|------|------|
| 条件类型 | 类型层面的条件判断 |
| infer | 从类型中提取子类型 |
| 映射类型 | 变换已有类型的属性 |
| 模板字面量 | 字符串类型的模式匹配 |
| 递归类型 | 处理嵌套数据结构 |

类型体操的终极目标不是炫技，而是**让错误在编译时被捕获，让 API 的使用方式不言自明**。当你写出一个优秀的泛型工具类型时，所有使用者都会感谢你。
