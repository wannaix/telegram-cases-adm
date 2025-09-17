# Telegram Cases Admin Panel

Административная панель для управления кейсами Telegram Mini App.

## Функциональность

- 📊 **Дашборд** - Статистика и общий обзор
- 👥 **Управление пользователями** - Просмотр, блокировка, изменение баланса
- 📦 **Управление кейсами** - Создание кейсов с NFT от партнеров
- 🎁 **Подарки** - Управление подарками
- 🎫 **Промокоды** - Создание и управление промокодами
- 🔗 **Реферальные ссылки** - Отслеживание рефералов
- 📝 **Логи** - Просмотр действий администраторов

## Технологии

- React 18 + TypeScript
- Vite для сборки
- TailwindCSS для стилизации
- TanStack Query для управления состоянием сервера
- Zustand для локального состояния
- Lucide React для иконок

## Интеграции

### Partners API
Интеграция с partners API (portals-market.com) для:
- Получения списка доступных NFT
- Создания кейсов с реальными NFT
- Управления ценами и редкостью предметов

### Backend API
Связь с backend приложения для:
- Создания и управления кейсами
- Получения статистики
- Управления пользователями
- Ведения логов

## Разработка

### Установка зависимостей
```bash
npm install
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Сборка для production
```bash
npm run build
```

### Линтинг
```bash
npm run lint
```

## Конфигурация

### Переменные окружения

Создайте файл `.env.local` с необходимыми переменными:

```env
VITE_API_URL=http://localhost:8080
VITE_PARTNERS_API_URL=https://portals-market.com
VITE_PARTNERS_TOKEN=your-partners-token
```

### Настройка API

1. **Backend API** - обновите URL в `src/services/adminApi.ts`
2. **Partners API** - обновите токен в `src/services/partnersApi.ts`

## Деплой на Render.com

### Автоматический деплой

1. Подключите репозиторий к Render.com
2. Укажите `admin` как Root Directory
3. Настройте переменные окружения:
   - `VITE_API_URL` - URL вашего backend
   - `VITE_PARTNERS_API_URL` - https://portals-market.com  
   - `VITE_PARTNERS_TOKEN` - ваш partners token

### Настройки деплоя

- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -l 3000`
- **Publish Directory**: `dist`

### Использование render.yaml

В корне admin директории есть `render.yaml` файл для автоматического деплоя. Просто:

1. Обновите URL backend в файле
2. Коммитьте изменения
3. Подключите репозиторий к Render.com

## Структура проекта

```
admin/
├── src/
│   ├── components/          # React компоненты
│   │   ├── layout/         # Layout компоненты
│   │   └── ui/             # UI компоненты
│   ├── pages/              # Страницы приложения
│   │   ├── Cases/          # Управление кейсами
│   │   ├── Dashboard/      # Дашборд
│   │   ├── Login/          # Аутентификация
│   │   └── ...
│   ├── services/           # API сервисы
│   │   ├── adminApi.ts     # Backend API
│   │   └── partnersApi.ts  # Partners API
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript типы
│   └── utils/              # Утилиты
├── public/                 # Статические файлы
└── dist/                   # Сборка для production
```

## API Интеграция

### Partners API Endpoints

- `GET /partners/nfts/owned` - Получение собственных NFT
- `GET /partners/nfts/search` - Поиск NFT
- `GET /partners/market/config` - Конфигурация маркета
- `GET /partners/collections/floors` - Floor цены коллекций

### Backend API Endpoints

- `POST /admin/cases/with-nfts` - Создание кейса с NFT
- `GET /admin/cases` - Получение списка кейсов
- `GET /admin/stats` - Статистика
- `GET /admin/users` - Управление пользователями

## Создание кейсов

### Процесс создания кейса с NFT:

1. **Выбор NFT** - из списка доступных NFT через Partners API
2. **Настройка редкости** - присвоение уровня редкости каждому NFT
3. **Настройка шансов** - указание процентной вероятности выпадения (сумма должна быть 100%)
4. **Создание кейса** - отправка данных в backend для сохранения

### Валидация:
- Название кейса обязательно
- Цена должна быть больше 0
- Минимум 1 NFT в кейсе
- Сумма шансов должна быть ровно 100%

## Аутентификация

Аутентификация пользователей админ панели происходит через:
- JWT токены от backend
- Роли администраторов
- Логирование всех действий

## Мониторинг

Все действия администраторов логируются:
- Создание/изменение кейсов
- Изменение пользователей
- Создание промокодов
- Просмотр статистики

## Поддержка

При возникновении проблем:
1. Проверьте переменные окружения
2. Убедитесь что backend доступен
3. Проверьте Partners API токен
4. Посмотрите логи в консоли браузера
=======
# Telegram Cases Admin



## Getting started

To make it easy for you to get started with GitLab, here's a list of recommended next steps.

Already a pro? Just edit this README.md and make it your own. Want to make it easy? [Use the template at the bottom](#editing-this-readme)!

## Add your files

- [ ] [Create](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-file) or [upload](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#upload-a-file) files
- [ ] [Add files using the command line](https://docs.gitlab.com/topics/git/add_files/#add-files-to-a-git-repository) or push an existing Git repository with the following command:

```
cd existing_repo
git remote add origin https://gitlab.com/Monty2493/telegram-cases-admin.git
git branch -M main
git push -uf origin main
```

## Integrate with your tools

- [ ] [Set up project integrations](https://gitlab.com/Monty2493/telegram-cases-admin/-/settings/integrations)

## Collaborate with your team

- [ ] [Invite team members and collaborators](https://docs.gitlab.com/ee/user/project/members/)
- [ ] [Create a new merge request](https://docs.gitlab.com/ee/user/project/merge_requests/creating_merge_requests.html)
- [ ] [Automatically close issues from merge requests](https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#closing-issues-automatically)
- [ ] [Enable merge request approvals](https://docs.gitlab.com/ee/user/project/merge_requests/approvals/)
- [ ] [Set auto-merge](https://docs.gitlab.com/user/project/merge_requests/auto_merge/)

## Test and Deploy

Use the built-in continuous integration in GitLab.

- [ ] [Get started with GitLab CI/CD](https://docs.gitlab.com/ee/ci/quick_start/)
- [ ] [Analyze your code for known vulnerabilities with Static Application Security Testing (SAST)](https://docs.gitlab.com/ee/user/application_security/sast/)
- [ ] [Deploy to Kubernetes, Amazon EC2, or Amazon ECS using Auto Deploy](https://docs.gitlab.com/ee/topics/autodevops/requirements.html)
- [ ] [Use pull-based deployments for improved Kubernetes management](https://docs.gitlab.com/ee/user/clusters/agent/)
- [ ] [Set up protected environments](https://docs.gitlab.com/ee/ci/environments/protected_environments.html)

***

# Editing this README

When you're ready to make this README your own, just edit this file and use the handy template below (or feel free to structure it however you want - this is just a starting point!). Thanks to [makeareadme.com](https://www.makeareadme.com/) for this template.

## Suggestions for a good README

Every project is different, so consider which of these sections apply to yours. The sections used in the template are suggestions for most open source projects. Also keep in mind that while a README can be too long and detailed, too long is better than too short. If you think your README is too long, consider utilizing another form of documentation rather than cutting out information.

## Name
Choose a self-explaining name for your project.

## Description
Let people know what your project can do specifically. Provide context and add a link to any reference visitors might be unfamiliar with. A list of Features or a Background subsection can also be added here. If there are alternatives to your project, this is a good place to list differentiating factors.

## Badges
On some READMEs, you may see small images that convey metadata, such as whether or not all the tests are passing for the project. You can use Shields to add some to your README. Many services also have instructions for adding a badge.

## Visuals
Depending on what you are making, it can be a good idea to include screenshots or even a video (you'll frequently see GIFs rather than actual videos). Tools like ttygif can help, but check out Asciinema for a more sophisticated method.

## Installation
Within a particular ecosystem, there may be a common way of installing things, such as using Yarn, NuGet, or Homebrew. However, consider the possibility that whoever is reading your README is a novice and would like more guidance. Listing specific steps helps remove ambiguity and gets people to using your project as quickly as possible. If it only runs in a specific context like a particular programming language version or operating system or has dependencies that have to be installed manually, also add a Requirements subsection.

## Usage
Use examples liberally, and show the expected output if you can. It's helpful to have inline the smallest example of usage that you can demonstrate, while providing links to more sophisticated examples if they are too long to reasonably include in the README.

## Support
Tell people where they can go to for help. It can be any combination of an issue tracker, a chat room, an email address, etc.

## Roadmap
If you have ideas for releases in the future, it is a good idea to list them in the README.

## Contributing
State if you are open to contributions and what your requirements are for accepting them.

For people who want to make changes to your project, it's helpful to have some documentation on how to get started. Perhaps there is a script that they should run or some environment variables that they need to set. Make these steps explicit. These instructions could also be useful to your future self.

You can also document commands to lint the code or run tests. These steps help to ensure high code quality and reduce the likelihood that the changes inadvertently break something. Having instructions for running tests is especially helpful if it requires external setup, such as starting a Selenium server for testing in a browser.

## Authors and acknowledgment
Show your appreciation to those who have contributed to the project.

## License
For open source projects, say how it is licensed.

## Project status
If you have run out of energy or time for your project, put a note at the top of the README saying that development has slowed down or stopped completely. Someone may choose to fork your project or volunteer to step in as a maintainer or owner, allowing your project to keep going. You can also make an explicit request for maintainers.
>>>>>>> README.md
