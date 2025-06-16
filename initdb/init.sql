CREATE TABLE IF NOT EXISTS business_advisory (
    id SERIAL PRIMARY KEY,
    officer_id VARCHAR(255),
    officer_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    company_id VARCHAR(255)
);

-- Insert default root user
INSERT INTO business_advisory (officer_id, officer_name, email, password, company_id)
VALUES ('ROOT-001', 'System Admin', 'root@root.com', 'password', 'ROOT-COMP')
ON CONFLICT (email) DO NOTHING;

CREATE TABLE public.business_development (
    id SERIAL PRIMARY KEY,
    dev_id VARCHAR(255) NOT NULL,
    dev_type VARCHAR(255) NOT NULL
);

CREATE TABLE public.business_sector (
    id SERIAL PRIMARY KEY,
    sector_id VARCHAR(255) NOT NULL UNIQUE,
    sector_name VARCHAR(255) NOT NULL
);

CREATE TABLE public.company (
    id SERIAL PRIMARY KEY,
    startup_name VARCHAR(255) NOT NULL,
    product_service_description TEXT,
    team_size VARCHAR(255) NOT NULL,
    founder_count VARCHAR(255) NOT NULL,
    male_count VARCHAR(255) NOT NULL,
    female_count VARCHAR(255) NOT NULL,
    youth_count VARCHAR(255) NOT NULL,
    adult_count VARCHAR(255) NOT NULL,
    officer_id VARCHAR(255),
    sector_id VARCHAR(255),
    dev_type VARCHAR(255),
    company_id VARCHAR(255),
    generated_revenue VARCHAR(255),
    status VARCHAR(255)
);

CREATE TABLE public.incubation (
    id SERIAL PRIMARY KEY,
    incubation_id VARCHAR(255) UNIQUE,
    year_of_incubation VARCHAR(255) NOT NULL,
    membership_stage VARCHAR(255) NOT NULL,
    start_day_of_agreement DATE NOT NULL,
    end_day_of_agreement DATE NOT NULL,
    duration_of_agreement VARCHAR(255),
    company_id VARCHAR(255) NOT NULL,
    officer_id VARCHAR(255) NOT NULL
);

