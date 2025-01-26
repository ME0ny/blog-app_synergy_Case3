export const mockPosts = [
  {
    id: "1",
    author: "user1",
    title: "Первый пост",
    content: "Это пример публичного поста. Здесь может быть длинный текст.",
    is_public: true,
    tags: ["технологии", "программирование"],
    created_at: "2023-10-01T12:00:00Z",
    access_status: "approved", // Публичный пост, доступен всем
    comments: [
      { id: "1", author: "user2", text: "Отличный пост!", created_at: "2023-10-01T12:05:00Z" },
      { id: "2", author: "user3", text: "Спасибо за информацию!", created_at: "2023-10-01T12:10:00Z" },
    ],
  },
  {
    id: "2",
    author: "user2",
    title: "Приватный пост",
    content: "Это пример приватного поста. Только для избранных.",
    is_public: false,
    tags: ["личное", "секреты"],
    created_at: "2023-10-02T12:00:00Z",
    access_status: "", // Приватный пост, доступ не запрошен
    comments: [
      { id: "1", author: "user1", text: "Интересно!", created_at: "2023-10-02T12:05:00Z" },
      { id: "2", author: "user3", text: "Хочу узнать больше!", created_at: "2023-10-02T12:10:00Z" },
    ],
  },
  // Добавляем больше постов
  ...Array.from({ length: 5 }, (_, i) => ({
    id: String(i + 3),
    author: `user${(i % 10) + 1}`,
    title: `Пост номер ${i + 3}`,
    content: `Это пост номер ${i + 3}. Здесь может быть много текста.`,
    is_public: i % 2 === 0, // Чередуем публичные и приватные посты
    tags: i % 2 === 0 ? ["технологии", "новости"] : ["личное", "советы"],
    created_at: `2023-10-0${i + 1}T12:00:00Z`,
    access_status: i % 3 === 0 ? "pending" : i % 3 === 1 ? "approved" : "rejected", // Пример статусов доступа
    comments: Array.from({ length: 3 }, (_, j) => ({
      id: String(j + 1),
      author: `user${(j % 10) + 1}`,
      text: `Комментарий ${j + 1} к посту ${i + 3}`,
      created_at: `2023-10-0${i + 1}T12:0${j + 1}:00Z`,
    })),
  })),
];

// mockData.js
export const mockComments = [
  { id: "1", author: "user2", text: "Отличный пост!", created_at: "2023-10-01T12:05:00Z" },
  { id: "2", author: "user3", text: "Спасибо за информацию!", created_at: "2023-10-01T12:10:00Z" },
  { id: "3", author: "user1", text: "Интересно!", created_at: "2023-10-02T12:05:00Z" },
  { id: "4", author: "user3", text: "Хочу узнать больше!", created_at: "2023-10-02T12:10:00Z" },
  { id: "5", author: "user4", text: "Очень полезно!", created_at: "2023-10-03T12:05:00Z" },
  { id: "6", author: "user5", text: "Спасибо за пост!", created_at: "2023-10-03T12:10:00Z" },
  // Добавьте больше комментариев по желанию
];