-- DB & tables
CREATE DATABASE task_manager if not exists;

CREATE TABLE tasklist (
    id uuid NOT NULL,
    "position" integer NOT NULL,
    tasks uuid[] DEFAULT '{}'::uuid[],
    name character varying(100) NOT NULL,
    CONSTRAINT tasklist_position_check CHECK (("position" >= 0))
) if not exists;

CREATE TABLE tasks (
    id uuid NOT NULL,
    text character varying(200) NOT NULL,
    "position" integer NOT NULL,
    tasklist_id uuid,
    CONSTRAINT tasks_position_check CHECK (("position" >= 0))
) if not exists;


-- User (actions: select, insert, update, delete)

CREATE ROLE tm_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT  select, insert, update, delete on tasklist, tasks;

-- SQL Queries
select * from tasklist order by position;

select * from tasks order by tasklist_id, position;

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

