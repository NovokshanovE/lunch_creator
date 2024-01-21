-- DB & tables
CREATE DATABASE lunch_creator if not exists;

CREATE TABLE IF NOT EXISTS public.dishes
(
    id uuid NOT NULL,
    type_id uuid NOT NULL,
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "Dishes_pkey" PRIMARY KEY (id),
    CONSTRAINT dishes_types_fkey FOREIGN KEY (type_id)
        REFERENCES public.types (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
);

CREATE TABLE IF NOT EXISTS public.menu
(
    id uuid NOT NULL,
    variant integer NOT NULL,
    day character varying(100) COLLATE pg_catalog."default" NOT NULL,
    dish_id uuid[] DEFAULT '{}'::uuid[],
    CONSTRAINT "Menu_pkey" PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.types
(
    id uuid NOT NULL,
    type character varying(100) COLLATE pg_catalog."default" NOT NULL,
    "position" integer NOT NULL,
    CONSTRAINT "Types_pkey" PRIMARY KEY (id)
);


-- User (actions: select, insert, update, delete)

CREATE ROLE tm_admin LOGIN ENCRYPTED PASSWORD 'admin';
GRANT  select, insert, update, delete on menu, dishes, types to tm_admin;

-- SQL Queries
