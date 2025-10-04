create table if not exists "users" (
    "id" uuid primary key default gen_random_uuid(),
    "email" text not null unique,
    "first_name" text not null,
    "last_name" text not null,
    "password" text not null,
    "phone" numeric not null,
    "role" text not null,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone default now()
);

create table if not exists "bookings" (
    "id" uuid primary key default gen_random_uuid(),
    "barber" text not null,
    "services" jsonb not null,
    "datetime" text not null,
    "customer_id" uuid not null,
    "validation" boolean not null default false,
    "totalPrice" numeric not null,
    "created_at" timestamp with time zone default now()
);

create table if not exists "customers" (
    "id" uuid primary key default gen_random_uuid(),
    "name" text not null,
    "email" text not null unique,
    "phone" text not null unique,
    "created_at" timestamp with time zone default now()
);

create table if not exists "services" (
    "id" serial primary key,
    "name" text not null,
    "price" numeric not null,
    "description" text not null,
    "duration" numeric not null,
    "created_at" timestamp with time zone default now()
);

create table if not exists "my_services" (
    "id" serial primary key,
    "user_id" uuid not null references "users"("id") on delete cascade,
    "service_id" integer not null references "services"("id") on delete cascade,
    "created_at" timestamp with time zone default now(),
    unique("user_id", "service_id")
);

-- Create indexes for better performance on my_services
create index if not exists "idx_my_services_user_id" on "my_services"("user_id");
create index if not exists "idx_my_services_service_id" on "my_services"("service_id");