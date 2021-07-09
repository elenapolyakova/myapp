## Установка

1. Склонировать репозиторий.
2. Переместить склонированный проект в нужный каталог
3. Скопировать файл **utils/retc_server.service**  в **/etc/systemd/system/**
4. В параметре **ExecStart** скрипта заменить путь к папке с проектом.
5. Для добавления в автозапуск выполнить **sudo systemctl enable retc_server** 
6. Чтобы запустить в текущей сессии  **sudo systemctl start retc_server** 

