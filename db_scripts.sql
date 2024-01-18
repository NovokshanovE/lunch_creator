-- DB & tables
CREATE DATABASE lunch_creator if not exists;

CREATE TABLE IF NOT EXISTS public."dishes"
(
    id uuid NOT NULL,
    type_id uuid NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Dishes_pkey" PRIMARY KEY (id),
    CONSTRAINT dishes_types_fkey FOREIGN KEY (type_id)
        REFERENCES public."Types" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public."menu"
(
    id uuid NOT NULL,
    variant integer NOT NULL,
    day character varying(100) COLLATE pg_catalog."default" NOT NULL,
    dish_is uuid,
    CONSTRAINT "Menu_pkey" PRIMARY KEY (id),
    CONSTRAINT menu_dishes_fkey FOREIGN KEY (dish_is)
        REFERENCES public."Dishes" (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
);

CREATE TABLE IF NOT EXISTS public."types"
(
    id uuid NOT NULL,
    type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "position" integer NOT NULL,
    CONSTRAINT "Types_pkey" PRIMARY KEY (id)
);


-- User (actions: select, insert, update, delete)

CREATE ROLE tm_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT  select, insert, update, delete on menu, dishes, types;

-- SQL Queries

--Get menu list
select * from Menu order by day;

--Get dishes from menu
select menu_id, dish_id, position, type from menu_dishes as md
join dishes on md.dish_id = dishes.id
join menu on menu.id = md.menu_id
join "types" on dishes.type_id = "types".id
order by position;

insert into tasklist (id, name, position) values (<id>, <name>, <pos>);

insert into tasks (id, text, position, tasklist_id) values (<id>, <name>, <pos>, <tasklist_id>);
update tasklist set tasks = array_append(tasks, <id>) where id = <tasklist_id>;

update tasks set text = <text>, position = <position> where id = <id>;

select tasklist_id from tasks where id = <task_id>;
delete from tasks where id = <task_id>;
update tasklist set tasks = array_remove(tasks, <task_id>) where id = <tasklist_id>;


update tasks set tasklist_id = <dest_tasklist_id> where id = <task_id>;
update tasklist set tasks = array_append(tasks, <task_id>) where id = <dest_tasklist_id>;
update tasklist set tasks = array_remove(tasks, <task_id>) where id = <src_tasklist_id>;

