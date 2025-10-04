-- Create my_services table for user service selections
create table if not exists "my_services" (
    "id" serial primary key,
    "user_id" uuid not null references "users"("id") on delete cascade,
    "service_id" integer not null references "services"("id") on delete cascade,
    "created_at" timestamp with time zone default now(),
    unique("user_id", "service_id")
);

-- Create indexes for better performance
create index if not exists "idx_my_services_user_id" on "my_services"("user_id");
create index if not exists "idx_my_services_service_id" on "my_services"("service_id");

-- Enable Row Level Security (RLS) 
alter table "my_services" enable row level security;

-- Create RLS policies
create policy "Users can view their own services" on "my_services"
    for select using (auth.uid() = user_id);

create policy "Users can insert their own services" on "my_services"
    for insert with check (auth.uid() = user_id);

create policy "Users can delete their own services" on "my_services"
    for delete using (auth.uid() = user_id);
