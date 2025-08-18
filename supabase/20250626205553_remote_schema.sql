create type "public"."CompetitionType" as enum ('CHARITY', 'CROSSFIT_LICENCED_EVENT', 'CROSSFIT_SEMI_FINALS', 'IN_HOUSE', 'ELITE', 'INTERMEDIATE', 'MASTERS', 'OLYMPIC_WEIGHTLIFTING', 'POWERLIFTING', 'PRIZE_AWARDED', 'QUALIFIER', 'STRONGMAN', 'TEEN', 'VIRTUAL', 'WOMENS_ONLY');

create type "public"."Currency" as enum ('USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'DKK', 'HKD', 'NOK', 'NZD', 'SEK', 'SGD', 'ZAR', 'AED', 'BRL', 'INR', 'MXN', 'THB');

create type "public"."Difficulty" as enum ('RX', 'SCALED', 'EVERYDAY', 'ELITE', 'OPEN', 'INTERMEDIATE', 'MASTERS', 'TEEN');

create type "public"."DirectoryCompType" as enum ('CROSSFIT', 'HYROX', 'HYROX_SIMULATION', 'OTHER');

create type "public"."DivisionScoreType" as enum ('POINTS_PER_PLACE', 'POINT_BASED', 'CUMULATIVE_UNITS');

create type "public"."Gender" as enum ('MALE', 'FEMALE', 'MIXED');

create type "public"."HeatLimitType" as enum ('ENTRIES', 'ATHLETES');

create type "public"."InvitationStatus" as enum ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

create type "public"."PartnerInterestTeamMemberStatus" as enum ('INVITED', 'ACCEPTED', 'REJECTED');

create type "public"."PartnerRequestStatus" as enum ('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED');

create type "public"."QuestionType" as enum ('TEXT', 'EMAIL', 'MULTIPLE_CHOICE', 'MULTIPLE_CHOICE_SELECT_ONE', 'DROPDOWN', 'STATEMENT', 'INTEGRATION');

create type "public"."RequiredStatus" as enum ('REQUIRED', 'OPTIONAL', 'OFF');

create type "public"."ScoreType" as enum ('REPS_MORE_IS_BETTER', 'REPS_LESS_IS_BETTER', 'WEIGHT_MORE_IS_BETTER', 'WEIGHT_LESS_IS_BETTER', 'TIME_MORE_IS_BETTER', 'TIME_LESS_IS_BETTER');

create type "public"."TeamMemberStatus" as enum ('PENDING', 'ACCEPTED', 'REJECTED');

create type "public"."TeammateListingStatus" as enum ('ACTIVE', 'FILLED', 'EXPIRED', 'CANCELLED');

create type "public"."TeammateListingType" as enum ('LOOKING_FOR_TEAM', 'LOOKING_FOR_MEMBERS');

create type "public"."Tiebreaker" as enum ('BEST_OVERALL_FINISH', 'NONE', 'SPECIFIC_WORKOUT');

create type "public"."Unit" as enum ('REPS', 'FEET', 'METERS', 'KILOMETERS', 'KILOGRAMS', 'POUNDS', 'MILES', 'PLACEMENT', 'CALORIES', 'ROUND', 'OTHER', 'SECONDS', 'MINUTES');

create sequence "public"."migrations_id_seq";

create table "public"."Address" (
    "id" uuid not null default uuid_generate_v4(),
    "venue" character varying(255),
    "street" character varying(255),
    "city" character varying(255),
    "postcode" character varying(50),
    "country" character varying(255),
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."AthleteCompetition" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid not null,
    "competitionId" character varying(8) not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Category" (
    "id" text not null,
    "directoryCompId" text not null,
    "price" numeric,
    "gender" "Gender" not null,
    "teamSize" integer not null,
    "difficulty" "Difficulty" not null,
    "isSoldOut" boolean not null default false,
    "tags" text[],
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Competition" (
    "id" character varying(8) not null,
    "name" character varying(255) not null,
    "types" "CompetitionType"[],
    "gender" "Gender",
    "difficulty" "Difficulty",
    "description" text,
    "startDateTime" timestamp with time zone not null,
    "endDateTime" timestamp with time zone,
    "addressId" uuid,
    "timezone" character varying(255),
    "logo" character varying(255),
    "createdByUserId" uuid,
    "orgId" uuid,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "isActive" boolean not null default true,
    "directoryCompId" text,
    "testField" text,
    "country" text,
    "state" text,
    "region" text,
    "website" text,
    "email" text,
    "instagramHandle" text,
    "ticketWebsite" text,
    "ctaLink" text,
    "price" numeric,
    "currency" text,
    "source" text not null default 'USER_CREATED'::text,
    "externalUrl" text,
    "teamSize" text
);


create table "public"."CompetitionCreator" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid not null,
    "competitionId" character varying(8) not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."DirectoryComp" (
    "id" text not null,
    "title" text not null,
    "teamSize" text,
    "location" text not null,
    "country" text not null,
    "startDate" timestamp with time zone not null,
    "endDate" timestamp with time zone,
    "price" numeric,
    "currency" text,
    "website" text,
    "email" text,
    "instagramHandle" text,
    "logo" text,
    "description" text,
    "type" "DirectoryCompType" not null default 'OTHER'::"DirectoryCompType",
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "ctaLink" text,
    "ticketWebsite" text,
    "state" text,
    "region" text,
    "competitionId" text
);


create table "public"."EarlyBird" (
    "id" uuid not null default uuid_generate_v4(),
    "startDateTime" timestamp with time zone,
    "endDateTime" timestamp with time zone,
    "price" double precision not null,
    "limit" integer,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "ticketTypeId" uuid
);


create table "public"."Entry" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid,
    "teamId" uuid,
    "ticketTypeId" uuid not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Feedback" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid,
    "createdAt" timestamp with time zone not null default now(),
    "text" text not null
);


create table "public"."Heat" (
    "id" uuid not null default uuid_generate_v4(),
    "startTime" timestamp with time zone not null,
    "workoutId" uuid not null,
    "maxLimitPerHeat" integer not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."HeatTicketTypes" (
    "heatId" uuid not null,
    "ticketTypeId" uuid not null
);


create table "public"."Integration" (
    "id" uuid not null default uuid_generate_v4(),
    "type" character varying(50) not null,
    "registrationAnswerId" uuid not null,
    "accessToken" text not null,
    "refreshToken" text not null,
    "expiresAt" timestamp with time zone not null,
    "athleteId" character varying(255) not null,
    "athleteFirstname" character varying(255),
    "athleteLastname" character varying(255),
    "athleteProfile" text,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Invitation" (
    "id" uuid not null default uuid_generate_v4(),
    "teamId" uuid not null,
    "token" character varying(255) not null,
    "email" character varying(255),
    "status" "InvitationStatus" not null default 'PENDING'::"InvitationStatus",
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "sentByUserId" uuid
);


create table "public"."Lane" (
    "id" uuid not null default uuid_generate_v4(),
    "number" integer not null,
    "entryId" uuid not null,
    "heatId" uuid not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."NotificationSubscription" (
    "id" uuid not null default uuid_generate_v4(),
    "email" character varying(255) not null,
    "userId" uuid,
    "eventType" character varying(255),
    "gender" character varying(255),
    "teamSize" character varying(255),
    "difficulty" character varying(255),
    "tags" text[] default ARRAY[]::text[],
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "countries" text[] default ARRAY[]::text[],
    "locations" text[] default ARRAY[]::text[]
);


create table "public"."Org" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(255) not null,
    "image" character varying(255) not null,
    "email" character varying(255) not null,
    "contactNumber" character varying(50),
    "description" text,
    "website" character varying(255),
    "logo" character varying(255),
    "facebook" character varying(255),
    "instagram" character varying(255),
    "twitter" character varying(255),
    "youtube" character varying(255),
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."PartnerInterest" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid not null,
    "interestType" character varying(50) not null,
    "partnerPreference" character varying(50) not null,
    "categoryId" text not null,
    "description" text,
    "status" character varying(50) not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "phone" text
);


create table "public"."PartnerInterestTeamMember" (
    "id" uuid not null default uuid_generate_v4(),
    "partnerInterestId" uuid not null,
    "name" text not null,
    "email" text not null,
    "userId" uuid,
    "status" "PartnerInterestTeamMemberStatus" not null default 'INVITED'::"PartnerInterestTeamMemberStatus",
    "invitationToken" text,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."PartnerRequest" (
    "id" uuid not null default uuid_generate_v4(),
    "fromInterestId" uuid,
    "fromUserId" uuid,
    "toInterestId" uuid not null,
    "message" text,
    "status" "PartnerRequestStatus" not null default 'PENDING'::"PartnerRequestStatus",
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "phone" text
);


create table "public"."Payment" (
    "id" uuid not null default uuid_generate_v4(),
    "registrationId" uuid not null,
    "paymentIntentId" character varying(255) not null,
    "amount" integer not null,
    "currency" character varying(255) not null,
    "status" character varying(255) not null,
    "userId" uuid,
    "customerId" character varying(255) not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Referral" (
    "id" uuid not null default uuid_generate_v4(),
    "referrerId" uuid,
    "referredId" uuid,
    "createdAt" timestamp with time zone not null default now()
);


create table "public"."Registration" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid,
    "competitionId" character varying(8) not null,
    "ticketTypeId" uuid not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "isCheckedIn" boolean not null default false
);


create table "public"."RegistrationAnswer" (
    "id" uuid not null default uuid_generate_v4(),
    "registrationId" uuid not null,
    "registrationFieldId" uuid not null,
    "answer" text not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."RegistrationField" (
    "id" uuid not null default uuid_generate_v4(),
    "question" character varying(255) not null,
    "type" "QuestionType" not null,
    "requiredStatus" "RequiredStatus" not null,
    "isEditable" boolean not null,
    "options" text[],
    "sortOrder" integer not null,
    "repeatPerAthlete" boolean not null default false,
    "createdAt" timestamp with time zone not null default now(),
    "onlyTeams" boolean not null default false,
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."RegistrationFieldTicketTypes" (
    "id" uuid not null default uuid_generate_v4(),
    "registrationFieldId" uuid not null,
    "ticketTypeId" uuid not null
);


create table "public"."Score" (
    "id" uuid not null default uuid_generate_v4(),
    "value" character varying(255) not null,
    "entryId" uuid not null,
    "workoutId" uuid not null,
    "scorecard" text,
    "note" text,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."ScoreSetting" (
    "id" uuid not null default uuid_generate_v4(),
    "competitionId" character varying(8) not null,
    "penalizeIncomplete" boolean not null default true,
    "penalizeScaled" boolean not null default true,
    "handleTie" "Tiebreaker" not null,
    "scoring" "DivisionScoreType" not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "totalHeatsPerWorkout" integer,
    "oneTicketPerHeat" boolean not null default true,
    "heatsEveryXMinutes" integer not null default 30,
    "heatLimitType" "HeatLimitType" not null default 'ENTRIES'::"HeatLimitType",
    "maxLimitPerHeat" integer not null default 6,
    "ticketTypeOrderIds" uuid[] not null default '{}'::uuid[]
);


create table "public"."SentEmail" (
    "id" uuid not null default uuid_generate_v4(),
    "userId" uuid not null,
    "recipients" text[] not null,
    "subject" character varying(255) not null,
    "message" text not null,
    "sentAt" timestamp with time zone not null default now(),
    "competitionId" text
);


create table "public"."Team" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(255),
    "teamCaptainId" uuid not null,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "status" character varying(50) not null default 'ACTIVE'::character varying
);


create table "public"."TeamMember" (
    "id" uuid not null default uuid_generate_v4(),
    "teamId" uuid not null,
    "userId" uuid,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "email" character varying(255),
    "status" "TeamMemberStatus" default 'ACCEPTED'::"TeamMemberStatus"
);


create table "public"."TeammateListing" (
    "id" text not null,
    "userId" uuid,
    "listingType" "TeammateListingType" not null,
    "competitionId" text,
    "directoryCompId" text,
    "targetCategoryId" text,
    "targetTicketTypeId" uuid,
    "teamId" uuid,
    "description" text,
    "contactInfo" text not null,
    "status" "TeammateListingStatus" not null default 'ACTIVE'::"TeammateListingStatus",
    "difficulty" "Difficulty",
    "gender" "Gender",
    "teamSize" integer,
    "country" text,
    "region" text,
    "eventType" text,
    "expiresAt" timestamp with time zone,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."TicketType" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(255) not null,
    "description" text,
    "maxEntries" integer not null,
    "teamSize" integer not null,
    "price" double precision not null,
    "currency" "Currency",
    "competitionId" character varying(8) not null,
    "earlyBirdId" uuid,
    "stripeProductId" character varying(255),
    "stripePriceId" character varying(255),
    "isVolunteer" boolean not null default false,
    "passOnPlatformFee" boolean not null default false,
    "refundPolicy" text,
    "divisionScoreType" "DivisionScoreType",
    "allowHeatSelection" boolean not null default false,
    "maxEntriesPerHeat" integer,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."User" (
    "id" uuid not null default uuid_generate_v4(),
    "firstName" character varying(255) not null,
    "lastName" character varying(255),
    "email" character varying(255) not null,
    "picture" character varying(255),
    "hashedPassword" character varying(255),
    "isVerified" boolean not null default false,
    "verificationToken" character varying(255),
    "invitationId" character varying(255),
    "athleteCompetitionIds" text[] default ARRAY[]::text[],
    "createdCompetitionIds" text[] default ARRAY[]::text[],
    "referredBy" character varying(255),
    "referralCode" character varying(255),
    "orgId" uuid,
    "stripeCustomerId" character varying(255),
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "isSuperUser" boolean not null default false
);


create table "public"."UserProfile" (
    "id" uuid not null,
    "email" text not null,
    "firstName" text not null,
    "lastName" text,
    "picture" text,
    "bio" text,
    "isSuperUser" boolean not null default false,
    "isVerified" boolean not null default false,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now()
);


create table "public"."Workout" (
    "id" uuid not null default uuid_generate_v4(),
    "name" character varying(255) not null,
    "description" text not null,
    "releaseDateTime" timestamp with time zone not null,
    "competitionId" character varying(8) not null,
    "location" character varying(255) not null,
    "scoreType" "ScoreType" not null,
    "unitOfMeasurement" "Unit" not null,
    "timeCap" integer,
    "includeStandardsVideo" boolean not null default false,
    "createdAt" timestamp with time zone not null default now(),
    "updatedAt" timestamp with time zone not null default now(),
    "isVisible" boolean not null default true
);


create table "public"."addresses" (
    "id" uuid not null default uuid_generate_v4(),
    "venue" text,
    "city" text,
    "country" text,
    "created_at" timestamp with time zone default now(),
    "competition_id" text
);


create table "public"."competitions" (
    "id" text not null,
    "name" text not null,
    "description" text,
    "start_date_time" timestamp with time zone,
    "end_date_time" timestamp with time zone,
    "release_date_time" timestamp with time zone,
    "timezone" text default 'UTC'::text,
    "has_workouts" boolean default true,
    "is_active" boolean default true,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."directory_competition_categories" (
    "id" uuid not null default uuid_generate_v4(),
    "directory_competition_id" text,
    "difficulty" text,
    "gender" text,
    "team_size" integer,
    "created_at" timestamp with time zone default now()
);


create table "public"."directory_competitions" (
    "id" text not null,
    "title" text not null,
    "location" text,
    "country" text,
    "start_date" date,
    "end_date" date,
    "competition_id" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."entries" (
    "id" uuid not null default uuid_generate_v4(),
    "team_id" uuid,
    "ticket_type_id" uuid,
    "invitation_token" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."migrations" (
    "id" integer not null default nextval('migrations_id_seq'::regclass),
    "name" character varying not null,
    "executed_at" timestamp without time zone default now()
);


create table "public"."partner_interests" (
    "id" uuid not null default uuid_generate_v4(),
    "user_id" uuid,
    "directory_comp_id" text,
    "category_id" uuid,
    "description" text,
    "phone" text,
    "status" text default 'ACTIVE'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."partner_requests" (
    "id" uuid not null default uuid_generate_v4(),
    "from_interest_id" uuid,
    "from_user_id" uuid,
    "to_interest_id" uuid,
    "message" text,
    "phone" text,
    "status" text default 'PENDING'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."team_members" (
    "id" uuid not null default uuid_generate_v4(),
    "team_id" uuid,
    "user_id" uuid,
    "is_captain" boolean default false,
    "created_at" timestamp with time zone default now()
);


create table "public"."teams" (
    "id" uuid not null default uuid_generate_v4(),
    "name" text,
    "competition_id" text,
    "status" text default 'ACTIVE'::text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."ticket_types" (
    "id" uuid not null default uuid_generate_v4(),
    "competition_id" text not null,
    "name" text not null,
    "price" numeric,
    "currency" text default 'USD'::text,
    "has_availability" boolean default true,
    "allow_heat_selection" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


create table "public"."users" (
    "id" uuid not null default uuid_generate_v4(),
    "email" text not null,
    "first_name" text,
    "last_name" text,
    "picture" text,
    "bio" text,
    "phone" text,
    "is_super_user" boolean default false,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);


alter sequence "public"."migrations_id_seq" owned by "public"."migrations"."id";

CREATE UNIQUE INDEX "Address_pkey" ON public."Address" USING btree (id);

CREATE UNIQUE INDEX "AthleteCompetition_pkey" ON public."AthleteCompetition" USING btree (id);

CREATE UNIQUE INDEX "Category_pkey" ON public."Category" USING btree (id);

CREATE UNIQUE INDEX "CompetitionCreator_pkey" ON public."CompetitionCreator" USING btree (id);

CREATE UNIQUE INDEX "Competition_pkey" ON public."Competition" USING btree (id);

CREATE UNIQUE INDEX "DirectoryComp_pkey" ON public."DirectoryComp" USING btree (id);

CREATE UNIQUE INDEX "EarlyBird_pkey" ON public."EarlyBird" USING btree (id);

CREATE UNIQUE INDEX "EarlyBird_ticketTypeId_key" ON public."EarlyBird" USING btree ("ticketTypeId");

CREATE UNIQUE INDEX "Entry_pkey" ON public."Entry" USING btree (id);

CREATE INDEX "Entry_ticketTypeId_idx" ON public."Entry" USING btree ("ticketTypeId");

CREATE UNIQUE INDEX "Feedback_pkey" ON public."Feedback" USING btree (id);

CREATE UNIQUE INDEX "Heat_pkey" ON public."Heat" USING btree (id);

CREATE INDEX "Heat_workoutId_idx" ON public."Heat" USING btree ("workoutId");

CREATE UNIQUE INDEX "Integration_pkey" ON public."Integration" USING btree (id);

CREATE UNIQUE INDEX "Invitation_pkey" ON public."Invitation" USING btree (id);

CREATE INDEX "Invitation_sentByUserId_idx" ON public."Invitation" USING btree ("sentByUserId");

CREATE INDEX "Invitation_sentByUserId_teamId_idx" ON public."Invitation" USING btree ("sentByUserId", "teamId");

CREATE INDEX "Invitation_teamId_idx" ON public."Invitation" USING btree ("teamId");

CREATE UNIQUE INDEX "Invitation_token_key" ON public."Invitation" USING btree (token);

CREATE INDEX "Lane_entryId_idx" ON public."Lane" USING btree ("entryId");

CREATE UNIQUE INDEX "Lane_pkey" ON public."Lane" USING btree (id);

CREATE UNIQUE INDEX "NotificationSubscription_pkey" ON public."NotificationSubscription" USING btree (id);

CREATE UNIQUE INDEX "Org_pkey" ON public."Org" USING btree (id);

CREATE UNIQUE INDEX "PartnerInterestTeamMember_pkey" ON public."PartnerInterestTeamMember" USING btree (id);

CREATE UNIQUE INDEX "PartnerInterest_pkey" ON public."PartnerInterest" USING btree (id);

CREATE UNIQUE INDEX "PartnerRequest_pkey" ON public."PartnerRequest" USING btree (id);

CREATE UNIQUE INDEX "Payment_pkey" ON public."Payment" USING btree (id);

CREATE UNIQUE INDEX "Payment_registrationId_key" ON public."Payment" USING btree ("registrationId");

CREATE UNIQUE INDEX "Referral_pkey" ON public."Referral" USING btree (id);

CREATE UNIQUE INDEX "RegistrationAnswer_pkey" ON public."RegistrationAnswer" USING btree (id);

CREATE INDEX "RegistrationAnswer_registrationFieldId_idx" ON public."RegistrationAnswer" USING btree ("registrationFieldId");

CREATE UNIQUE INDEX "RegistrationFieldTicketTypes_pkey" ON public."RegistrationFieldTicketTypes" USING btree (id);

CREATE INDEX "RegistrationFieldTicketTypes_ticketTypeId_idx" ON public."RegistrationFieldTicketTypes" USING btree ("ticketTypeId");

CREATE UNIQUE INDEX "RegistrationField_pkey" ON public."RegistrationField" USING btree (id);

CREATE INDEX "Registration_competitionId_idx" ON public."Registration" USING btree ("competitionId");

CREATE UNIQUE INDEX "Registration_pkey" ON public."Registration" USING btree (id);

CREATE INDEX "Registration_ticketTypeId_idx" ON public."Registration" USING btree ("ticketTypeId");

CREATE INDEX "ScoreSetting_competitionId_idx" ON public."ScoreSetting" USING btree ("competitionId");

CREATE UNIQUE INDEX "ScoreSetting_pkey" ON public."ScoreSetting" USING btree (id);

CREATE UNIQUE INDEX "Score_pkey" ON public."Score" USING btree (id);

CREATE INDEX "Score_workoutId_idx" ON public."Score" USING btree ("workoutId");

CREATE UNIQUE INDEX "SentEmail_pkey" ON public."SentEmail" USING btree (id);

CREATE UNIQUE INDEX "TeamMember_pkey" ON public."TeamMember" USING btree (id);

CREATE INDEX "TeamMember_userId_idx" ON public."TeamMember" USING btree ("userId");

CREATE UNIQUE INDEX "Team_pkey" ON public."Team" USING btree (id);

CREATE UNIQUE INDEX "TeammateListing_pkey" ON public."TeammateListing" USING btree (id);

CREATE INDEX "TicketType_competitionId_idx" ON public."TicketType" USING btree ("competitionId");

CREATE INDEX "TicketType_earlyBirdId_idx" ON public."TicketType" USING btree ("earlyBirdId");

CREATE UNIQUE INDEX "TicketType_pkey" ON public."TicketType" USING btree (id);

CREATE UNIQUE INDEX "UserProfile_email_key" ON public."UserProfile" USING btree (email);

CREATE UNIQUE INDEX "UserProfile_pkey" ON public."UserProfile" USING btree (id);

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);

CREATE UNIQUE INDEX "User_pkey" ON public."User" USING btree (id);

CREATE INDEX "Workout_competitionId_idx" ON public."Workout" USING btree ("competitionId");

CREATE UNIQUE INDEX "Workout_pkey" ON public."Workout" USING btree (id);

CREATE UNIQUE INDEX addresses_pkey ON public.addresses USING btree (id);

CREATE UNIQUE INDEX competitions_pkey ON public.competitions USING btree (id);

CREATE INDEX directory_comp_region_idx ON public."DirectoryComp" USING btree (region);

CREATE UNIQUE INDEX directory_competition_categories_pkey ON public.directory_competition_categories USING btree (id);

CREATE UNIQUE INDEX directory_competitions_pkey ON public.directory_competitions USING btree (id);

CREATE UNIQUE INDEX entries_pkey ON public.entries USING btree (id);

CREATE INDEX idx_athlete_competition_competition_id ON public."AthleteCompetition" USING btree ("competitionId");

CREATE INDEX idx_athlete_competition_user_id ON public."AthleteCompetition" USING btree ("userId");

CREATE INDEX idx_competition_creator_competition_id ON public."CompetitionCreator" USING btree ("competitionId");

CREATE INDEX idx_competition_creator_user_id ON public."CompetitionCreator" USING btree ("userId");

CREATE INDEX idx_competition_directory_comp_id ON public."Competition" USING btree ("directoryCompId");

CREATE INDEX idx_competition_location ON public."Competition" USING btree (country, region);

CREATE INDEX "idx_competition_name_orgId" ON public."Competition" USING btree (name, "orgId");

CREATE INDEX idx_competition_source ON public."Competition" USING btree (source);

CREATE UNIQUE INDEX "idx_entry_unique_userId_teamId" ON public."Entry" USING btree ("userId", "teamId");

CREATE INDEX "idx_entry_userId_teamId_ticketTypeId" ON public."Entry" USING btree ("userId", "teamId", "ticketTypeId");

CREATE INDEX "idx_heat_ticketType_heatId" ON public."HeatTicketTypes" USING btree ("heatId");

CREATE INDEX "idx_heat_ticketType_ticketTypeId" ON public."HeatTicketTypes" USING btree ("ticketTypeId");

CREATE INDEX idx_integration_athlete_id ON public."Integration" USING btree ("athleteId");

CREATE INDEX idx_integration_registration_answer_id ON public."Integration" USING btree ("registrationAnswerId");

CREATE INDEX idx_integration_type ON public."Integration" USING btree (type);

CREATE INDEX "idx_lane_heatId_entryId" ON public."Lane" USING btree ("heatId", "entryId");

CREATE INDEX idx_notification_subscription_difficulty ON public."NotificationSubscription" USING btree (difficulty);

CREATE INDEX idx_notification_subscription_email ON public."NotificationSubscription" USING btree (email);

CREATE INDEX idx_notification_subscription_gender ON public."NotificationSubscription" USING btree (gender);

CREATE INDEX "idx_notification_subscription_teamSize" ON public."NotificationSubscription" USING btree ("teamSize");

CREATE INDEX "idx_notification_subscription_userId" ON public."NotificationSubscription" USING btree ("userId");

CREATE INDEX idx_org_name ON public."Org" USING btree (name);

CREATE INDEX idx_partner_interest_category_id ON public."PartnerInterest" USING btree ("categoryId");

CREATE INDEX idx_partner_interest_category_status_created ON public."PartnerInterest" USING btree ("categoryId", status, "createdAt");

CREATE INDEX idx_partner_interest_interest_type ON public."PartnerInterest" USING btree ("interestType");

CREATE INDEX idx_partner_interest_status ON public."PartnerInterest" USING btree (status);

CREATE INDEX idx_partner_interest_status_category_created ON public."PartnerInterest" USING btree (status, "categoryId", "createdAt");

CREATE INDEX idx_partner_interest_status_type_created ON public."PartnerInterest" USING btree (status, "interestType", "createdAt");

CREATE INDEX idx_partner_interest_status_user_created ON public."PartnerInterest" USING btree (status, "userId", "createdAt");

CREATE INDEX idx_partner_interest_team_member_email ON public."PartnerInterestTeamMember" USING btree (email);

CREATE INDEX idx_partner_interest_team_member_partner_interest_id ON public."PartnerInterestTeamMember" USING btree ("partnerInterestId");

CREATE INDEX idx_partner_interest_team_member_token ON public."PartnerInterestTeamMember" USING btree ("invitationToken");

CREATE INDEX idx_partner_interest_team_member_user_id ON public."PartnerInterestTeamMember" USING btree ("userId");

CREATE INDEX idx_partner_interest_type_status_created ON public."PartnerInterest" USING btree ("interestType", status, "createdAt");

CREATE INDEX idx_partner_interest_user_id ON public."PartnerInterest" USING btree ("userId");

CREATE INDEX idx_partner_interest_user_status_created ON public."PartnerInterest" USING btree ("userId", status, "createdAt");

CREATE INDEX idx_partner_interests_user_id ON public.partner_interests USING btree (user_id);

CREATE INDEX idx_partner_request_from_interest_id ON public."PartnerRequest" USING btree ("fromInterestId");

CREATE INDEX idx_partner_request_from_user_id ON public."PartnerRequest" USING btree ("fromUserId");

CREATE INDEX idx_partner_request_status_created_at ON public."PartnerRequest" USING btree (status, "createdAt");

CREATE INDEX idx_partner_request_status_updated_at ON public."PartnerRequest" USING btree (status, "updatedAt");

CREATE INDEX idx_partner_request_to_interest_id ON public."PartnerRequest" USING btree ("toInterestId");

CREATE UNIQUE INDEX idx_partner_request_unique_interest_to ON public."PartnerRequest" USING btree ("fromInterestId", "toInterestId") WHERE ("fromInterestId" IS NOT NULL);

CREATE UNIQUE INDEX idx_partner_request_unique_user_to ON public."PartnerRequest" USING btree ("fromUserId", "toInterestId") WHERE ("fromUserId" IS NOT NULL);

CREATE INDEX idx_partner_requests_to_interest_id ON public.partner_requests USING btree (to_interest_id);

CREATE INDEX "idx_registrationAnswer_registrationId_registrationFieldId" ON public."RegistrationAnswer" USING btree ("registrationId", "registrationFieldId");

CREATE INDEX "idx_registration_userId_competitionId_ticketTypeId" ON public."Registration" USING btree ("userId", "competitionId", "ticketTypeId");

CREATE UNIQUE INDEX "idx_registrationfield_id_sortOrder" ON public."RegistrationField" USING btree (id, "sortOrder");

CREATE INDEX idx_registrationfield_tickettype ON public."RegistrationFieldTicketTypes" USING btree ("registrationFieldId", "ticketTypeId");

CREATE INDEX "idx_score_entryId_workoutId" ON public."Score" USING btree ("entryId", "workoutId");

CREATE UNIQUE INDEX "idx_score_unique_entryId_workoutId" ON public."Score" USING btree ("entryId", "workoutId");

CREATE INDEX idx_sent_email_competition_id ON public."SentEmail" USING btree ("competitionId");

CREATE UNIQUE INDEX "idx_team_member_unique_teamId_userId" ON public."TeamMember" USING btree ("teamId", "userId");

CREATE INDEX idx_team_status ON public."Team" USING btree (status);

CREATE INDEX "idx_team_teamCaptainId" ON public."Team" USING btree ("teamCaptainId");

CREATE INDEX idx_teammate_listing_competition_id ON public."TeammateListing" USING btree ("competitionId");

CREATE INDEX idx_teammate_listing_directory_comp_id ON public."TeammateListing" USING btree ("directoryCompId");

CREATE INDEX idx_teammate_listing_status ON public."TeammateListing" USING btree (status);

CREATE INDEX idx_teammate_listing_user_id ON public."TeammateListing" USING btree ("userId");

CREATE INDEX idx_teams_competition_id ON public.teams USING btree (competition_id);

CREATE INDEX "idx_ticketType_id_name_earlyBirdId" ON public."TicketType" USING btree (id, name, "earlyBirdId");

CREATE INDEX idx_user_profile_email ON public."UserProfile" USING btree (email);

CREATE INDEX idx_user_profile_id ON public."UserProfile" USING btree (id);

CREATE INDEX idx_user_referral_code ON public."User" USING btree ("referralCode");

CREATE INDEX idx_users_email ON public.users USING btree (email);

CREATE INDEX idx_workout_id_name ON public."Workout" USING btree (id, name);

CREATE UNIQUE INDEX migrations_pkey ON public.migrations USING btree (id);

CREATE UNIQUE INDEX partner_interests_pkey ON public.partner_interests USING btree (id);

CREATE UNIQUE INDEX partner_requests_pkey ON public.partner_requests USING btree (id);

CREATE UNIQUE INDEX "pk_HeatTicketTypes" ON public."HeatTicketTypes" USING btree ("heatId", "ticketTypeId");

CREATE UNIQUE INDEX team_members_pkey ON public.team_members USING btree (id);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

CREATE UNIQUE INDEX ticket_types_pkey ON public.ticket_types USING btree (id);

CREATE UNIQUE INDEX unique_registration_field_ticket_type ON public."RegistrationFieldTicketTypes" USING btree ("registrationFieldId", "ticketTypeId");

CREATE UNIQUE INDEX unique_user_ticket_type ON public."Entry" USING btree ("userId", "ticketTypeId");

CREATE UNIQUE INDEX uq_athlete_competition_user_competition ON public."AthleteCompetition" USING btree ("userId", "competitionId");

CREATE UNIQUE INDEX uq_competition_creator_user_competition ON public."CompetitionCreator" USING btree ("userId", "competitionId");

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."Address" add constraint "Address_pkey" PRIMARY KEY using index "Address_pkey";

alter table "public"."AthleteCompetition" add constraint "AthleteCompetition_pkey" PRIMARY KEY using index "AthleteCompetition_pkey";

alter table "public"."Category" add constraint "Category_pkey" PRIMARY KEY using index "Category_pkey";

alter table "public"."Competition" add constraint "Competition_pkey" PRIMARY KEY using index "Competition_pkey";

alter table "public"."CompetitionCreator" add constraint "CompetitionCreator_pkey" PRIMARY KEY using index "CompetitionCreator_pkey";

alter table "public"."DirectoryComp" add constraint "DirectoryComp_pkey" PRIMARY KEY using index "DirectoryComp_pkey";

alter table "public"."EarlyBird" add constraint "EarlyBird_pkey" PRIMARY KEY using index "EarlyBird_pkey";

alter table "public"."Entry" add constraint "Entry_pkey" PRIMARY KEY using index "Entry_pkey";

alter table "public"."Feedback" add constraint "Feedback_pkey" PRIMARY KEY using index "Feedback_pkey";

alter table "public"."Heat" add constraint "Heat_pkey" PRIMARY KEY using index "Heat_pkey";

alter table "public"."HeatTicketTypes" add constraint "pk_HeatTicketTypes" PRIMARY KEY using index "pk_HeatTicketTypes";

alter table "public"."Integration" add constraint "Integration_pkey" PRIMARY KEY using index "Integration_pkey";

alter table "public"."Invitation" add constraint "Invitation_pkey" PRIMARY KEY using index "Invitation_pkey";

alter table "public"."Lane" add constraint "Lane_pkey" PRIMARY KEY using index "Lane_pkey";

alter table "public"."NotificationSubscription" add constraint "NotificationSubscription_pkey" PRIMARY KEY using index "NotificationSubscription_pkey";

alter table "public"."Org" add constraint "Org_pkey" PRIMARY KEY using index "Org_pkey";

alter table "public"."PartnerInterest" add constraint "PartnerInterest_pkey" PRIMARY KEY using index "PartnerInterest_pkey";

alter table "public"."PartnerInterestTeamMember" add constraint "PartnerInterestTeamMember_pkey" PRIMARY KEY using index "PartnerInterestTeamMember_pkey";

alter table "public"."PartnerRequest" add constraint "PartnerRequest_pkey" PRIMARY KEY using index "PartnerRequest_pkey";

alter table "public"."Payment" add constraint "Payment_pkey" PRIMARY KEY using index "Payment_pkey";

alter table "public"."Referral" add constraint "Referral_pkey" PRIMARY KEY using index "Referral_pkey";

alter table "public"."Registration" add constraint "Registration_pkey" PRIMARY KEY using index "Registration_pkey";

alter table "public"."RegistrationAnswer" add constraint "RegistrationAnswer_pkey" PRIMARY KEY using index "RegistrationAnswer_pkey";

alter table "public"."RegistrationField" add constraint "RegistrationField_pkey" PRIMARY KEY using index "RegistrationField_pkey";

alter table "public"."RegistrationFieldTicketTypes" add constraint "RegistrationFieldTicketTypes_pkey" PRIMARY KEY using index "RegistrationFieldTicketTypes_pkey";

alter table "public"."Score" add constraint "Score_pkey" PRIMARY KEY using index "Score_pkey";

alter table "public"."ScoreSetting" add constraint "ScoreSetting_pkey" PRIMARY KEY using index "ScoreSetting_pkey";

alter table "public"."SentEmail" add constraint "SentEmail_pkey" PRIMARY KEY using index "SentEmail_pkey";

alter table "public"."Team" add constraint "Team_pkey" PRIMARY KEY using index "Team_pkey";

alter table "public"."TeamMember" add constraint "TeamMember_pkey" PRIMARY KEY using index "TeamMember_pkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_pkey" PRIMARY KEY using index "TeammateListing_pkey";

alter table "public"."TicketType" add constraint "TicketType_pkey" PRIMARY KEY using index "TicketType_pkey";

alter table "public"."User" add constraint "User_pkey" PRIMARY KEY using index "User_pkey";

alter table "public"."UserProfile" add constraint "UserProfile_pkey" PRIMARY KEY using index "UserProfile_pkey";

alter table "public"."Workout" add constraint "Workout_pkey" PRIMARY KEY using index "Workout_pkey";

alter table "public"."addresses" add constraint "addresses_pkey" PRIMARY KEY using index "addresses_pkey";

alter table "public"."competitions" add constraint "competitions_pkey" PRIMARY KEY using index "competitions_pkey";

alter table "public"."directory_competition_categories" add constraint "directory_competition_categories_pkey" PRIMARY KEY using index "directory_competition_categories_pkey";

alter table "public"."directory_competitions" add constraint "directory_competitions_pkey" PRIMARY KEY using index "directory_competitions_pkey";

alter table "public"."entries" add constraint "entries_pkey" PRIMARY KEY using index "entries_pkey";

alter table "public"."migrations" add constraint "migrations_pkey" PRIMARY KEY using index "migrations_pkey";

alter table "public"."partner_interests" add constraint "partner_interests_pkey" PRIMARY KEY using index "partner_interests_pkey";

alter table "public"."partner_requests" add constraint "partner_requests_pkey" PRIMARY KEY using index "partner_requests_pkey";

alter table "public"."team_members" add constraint "team_members_pkey" PRIMARY KEY using index "team_members_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."ticket_types" add constraint "ticket_types_pkey" PRIMARY KEY using index "ticket_types_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."AthleteCompetition" add constraint "fk_athlete_competition_competition" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) not valid;

alter table "public"."AthleteCompetition" validate constraint "fk_athlete_competition_competition";

alter table "public"."AthleteCompetition" add constraint "fk_athlete_competition_user" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."AthleteCompetition" validate constraint "fk_athlete_competition_user";

alter table "public"."AthleteCompetition" add constraint "uq_athlete_competition_user_competition" UNIQUE using index "uq_athlete_competition_user_competition";

alter table "public"."Category" add constraint "Category_directoryCompId_fkey" FOREIGN KEY ("directoryCompId") REFERENCES "DirectoryComp"(id) ON DELETE CASCADE not valid;

alter table "public"."Category" validate constraint "Category_directoryCompId_fkey";

alter table "public"."Competition" add constraint "chk_competition_source" CHECK ((source = ANY (ARRAY['USER_CREATED'::text, 'SCRAPED_ARETAS'::text, 'SCRAPED_COMP_CORNER'::text]))) not valid;

alter table "public"."Competition" validate constraint "chk_competition_source";

alter table "public"."CompetitionCreator" add constraint "fk_competition_creator_competition" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) not valid;

alter table "public"."CompetitionCreator" validate constraint "fk_competition_creator_competition";

alter table "public"."CompetitionCreator" add constraint "fk_competition_creator_user" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."CompetitionCreator" validate constraint "fk_competition_creator_user";

alter table "public"."CompetitionCreator" add constraint "uq_competition_creator_user_competition" UNIQUE using index "uq_competition_creator_user_competition";

alter table "public"."EarlyBird" add constraint "EarlyBird_ticketTypeId_key" UNIQUE using index "EarlyBird_ticketTypeId_key";

alter table "public"."EarlyBird" add constraint "fk_ticketTypeId" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"(id) ON DELETE SET NULL not valid;

alter table "public"."EarlyBird" validate constraint "fk_ticketTypeId";

alter table "public"."Entry" add constraint "fk_ticketTypeId" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"(id) ON DELETE CASCADE not valid;

alter table "public"."Entry" validate constraint "fk_ticketTypeId";

alter table "public"."Entry" add constraint "unique_user_ticket_type" UNIQUE using index "unique_user_ticket_type";

alter table "public"."Feedback" add constraint "fk_feedback_userId" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."Feedback" validate constraint "fk_feedback_userId";

alter table "public"."Heat" add constraint "fk_heat_workoutId" FOREIGN KEY ("workoutId") REFERENCES "Workout"(id) ON DELETE CASCADE not valid;

alter table "public"."Heat" validate constraint "fk_heat_workoutId";

alter table "public"."HeatTicketTypes" add constraint "HeatTicketTypes_heatId_fkey" FOREIGN KEY ("heatId") REFERENCES "Heat"(id) ON DELETE CASCADE not valid;

alter table "public"."HeatTicketTypes" validate constraint "HeatTicketTypes_heatId_fkey";

alter table "public"."HeatTicketTypes" add constraint "HeatTicketTypes_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"(id) ON DELETE CASCADE not valid;

alter table "public"."HeatTicketTypes" validate constraint "HeatTicketTypes_ticketTypeId_fkey";

alter table "public"."Integration" add constraint "fk_integration_registration_answer" FOREIGN KEY ("registrationAnswerId") REFERENCES "RegistrationAnswer"(id) not valid;

alter table "public"."Integration" validate constraint "fk_integration_registration_answer";

alter table "public"."Invitation" add constraint "Invitation_token_key" UNIQUE using index "Invitation_token_key";

alter table "public"."Invitation" add constraint "fk_invitation_sentByUserId" FOREIGN KEY ("sentByUserId") REFERENCES auth.users(id) not valid;

alter table "public"."Invitation" validate constraint "fk_invitation_sentByUserId";

alter table "public"."Invitation" add constraint "fk_invitation_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE not valid;

alter table "public"."Invitation" validate constraint "fk_invitation_teamId";

alter table "public"."Lane" add constraint "fk_lane_entryId" FOREIGN KEY ("entryId") REFERENCES "Entry"(id) ON DELETE CASCADE not valid;

alter table "public"."Lane" validate constraint "fk_lane_entryId";

alter table "public"."Lane" add constraint "fk_lane_heatId" FOREIGN KEY ("heatId") REFERENCES "Heat"(id) ON DELETE CASCADE not valid;

alter table "public"."Lane" validate constraint "fk_lane_heatId";

alter table "public"."PartnerInterest" add constraint "PartnerInterest_interestType_check" CHECK ((("interestType")::text = ANY ((ARRAY['LOOKING_FOR_JOINERS'::character varying, 'LOOKING_TO_JOIN'::character varying])::text[]))) not valid;

alter table "public"."PartnerInterest" validate constraint "PartnerInterest_interestType_check";

alter table "public"."PartnerInterest" add constraint "PartnerInterest_partnerPreference_check" CHECK ((("partnerPreference")::text = ANY ((ARRAY['ANYONE'::character varying, 'SAME_GYM'::character varying])::text[]))) not valid;

alter table "public"."PartnerInterest" validate constraint "PartnerInterest_partnerPreference_check";

alter table "public"."PartnerInterest" add constraint "PartnerInterest_status_check" CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('PARTIALLY_FILLED'::character varying)::text, ('FILLED'::character varying)::text, ('EXPIRED'::character varying)::text, ('CANCELLED'::character varying)::text]))) not valid;

alter table "public"."PartnerInterest" validate constraint "PartnerInterest_status_check";

alter table "public"."PartnerInterestTeamMember" add constraint "fk_partner_interest_team_member_partner_interest" FOREIGN KEY ("partnerInterestId") REFERENCES "PartnerInterest"(id) ON DELETE CASCADE not valid;

alter table "public"."PartnerInterestTeamMember" validate constraint "fk_partner_interest_team_member_partner_interest";

alter table "public"."PartnerRequest" add constraint "fk_partner_request_toInterestId" FOREIGN KEY ("toInterestId") REFERENCES "PartnerInterest"(id) ON DELETE CASCADE not valid;

alter table "public"."PartnerRequest" validate constraint "fk_partner_request_toInterestId";

alter table "public"."Payment" add constraint "Payment_registrationId_key" UNIQUE using index "Payment_registrationId_key";

alter table "public"."Payment" add constraint "fk_payment_registrationId" FOREIGN KEY ("registrationId") REFERENCES "Registration"(id) ON DELETE CASCADE not valid;

alter table "public"."Payment" validate constraint "fk_payment_registrationId";

alter table "public"."Payment" add constraint "fk_payment_userId" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."Payment" validate constraint "fk_payment_userId";

alter table "public"."Referral" add constraint "fk_referral_referredId" FOREIGN KEY ("referredId") REFERENCES auth.users(id) not valid;

alter table "public"."Referral" validate constraint "fk_referral_referredId";

alter table "public"."Referral" add constraint "fk_referral_referrerId" FOREIGN KEY ("referrerId") REFERENCES auth.users(id) not valid;

alter table "public"."Referral" validate constraint "fk_referral_referrerId";

alter table "public"."Registration" add constraint "fk_registration_competitionId" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) ON DELETE CASCADE not valid;

alter table "public"."Registration" validate constraint "fk_registration_competitionId";

alter table "public"."Registration" add constraint "fk_registration_ticketTypeId" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"(id) ON DELETE CASCADE not valid;

alter table "public"."Registration" validate constraint "fk_registration_ticketTypeId";

alter table "public"."Registration" add constraint "fk_registration_userId" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."Registration" validate constraint "fk_registration_userId";

alter table "public"."RegistrationAnswer" add constraint "fk_registrationAnswer_registrationFieldId" FOREIGN KEY ("registrationFieldId") REFERENCES "RegistrationField"(id) ON DELETE CASCADE not valid;

alter table "public"."RegistrationAnswer" validate constraint "fk_registrationAnswer_registrationFieldId";

alter table "public"."RegistrationAnswer" add constraint "fk_registrationAnswer_registrationId" FOREIGN KEY ("registrationId") REFERENCES "Registration"(id) ON DELETE CASCADE not valid;

alter table "public"."RegistrationAnswer" validate constraint "fk_registrationAnswer_registrationId";

alter table "public"."RegistrationFieldTicketTypes" add constraint "fk_registrationFieldId" FOREIGN KEY ("registrationFieldId") REFERENCES "RegistrationField"(id) ON DELETE CASCADE not valid;

alter table "public"."RegistrationFieldTicketTypes" validate constraint "fk_registrationFieldId";

alter table "public"."RegistrationFieldTicketTypes" add constraint "fk_ticketTypeId" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"(id) ON DELETE CASCADE not valid;

alter table "public"."RegistrationFieldTicketTypes" validate constraint "fk_ticketTypeId";

alter table "public"."RegistrationFieldTicketTypes" add constraint "unique_registration_field_ticket_type" UNIQUE using index "unique_registration_field_ticket_type";

alter table "public"."Score" add constraint "fk_score_entryId" FOREIGN KEY ("entryId") REFERENCES "Entry"(id) ON DELETE CASCADE not valid;

alter table "public"."Score" validate constraint "fk_score_entryId";

alter table "public"."Score" add constraint "fk_score_workoutId" FOREIGN KEY ("workoutId") REFERENCES "Workout"(id) ON DELETE CASCADE not valid;

alter table "public"."Score" validate constraint "fk_score_workoutId";

alter table "public"."ScoreSetting" add constraint "fk_scoreSetting_competitionId" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) ON DELETE CASCADE not valid;

alter table "public"."ScoreSetting" validate constraint "fk_scoreSetting_competitionId";

alter table "public"."Team" add constraint "Team_status_check" CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'COMPLETED'::character varying, 'CANCELLED'::character varying])::text[]))) not valid;

alter table "public"."Team" validate constraint "Team_status_check";

alter table "public"."TeamMember" add constraint "fk_team_member_teamId" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE CASCADE not valid;

alter table "public"."TeamMember" validate constraint "fk_team_member_teamId";

alter table "public"."TeamMember" add constraint "fk_team_member_userId" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."TeamMember" validate constraint "fk_team_member_userId";

alter table "public"."TeammateListing" add constraint "TeammateListing_competitionId_fkey" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) ON DELETE SET NULL not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_competitionId_fkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_directoryCompId_fkey" FOREIGN KEY ("directoryCompId") REFERENCES "DirectoryComp"(id) ON DELETE SET NULL not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_directoryCompId_fkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_targetCategoryId_fkey" FOREIGN KEY ("targetCategoryId") REFERENCES "Category"(id) ON DELETE SET NULL not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_targetCategoryId_fkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_targetTicketTypeId_fkey" FOREIGN KEY ("targetTicketTypeId") REFERENCES "TicketType"(id) ON DELETE SET NULL not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_targetTicketTypeId_fkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"(id) ON DELETE SET NULL not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_teamId_fkey";

alter table "public"."TeammateListing" add constraint "TeammateListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES auth.users(id) not valid;

alter table "public"."TeammateListing" validate constraint "TeammateListing_userId_fkey";

alter table "public"."TicketType" add constraint "fk_competitionId" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) ON DELETE CASCADE not valid;

alter table "public"."TicketType" validate constraint "fk_competitionId";

alter table "public"."TicketType" add constraint "fk_earlyBirdId" FOREIGN KEY ("earlyBirdId") REFERENCES "EarlyBird"(id) ON DELETE SET NULL not valid;

alter table "public"."TicketType" validate constraint "fk_earlyBirdId";

alter table "public"."User" add constraint "User_email_key" UNIQUE using index "User_email_key";

alter table "public"."UserProfile" add constraint "UserProfile_email_key" UNIQUE using index "UserProfile_email_key";

alter table "public"."Workout" add constraint "fk_workout_competitionId" FOREIGN KEY ("competitionId") REFERENCES "Competition"(id) ON DELETE CASCADE not valid;

alter table "public"."Workout" validate constraint "fk_workout_competitionId";

alter table "public"."addresses" add constraint "addresses_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES competitions(id) not valid;

alter table "public"."addresses" validate constraint "addresses_competition_id_fkey";

alter table "public"."directory_competition_categories" add constraint "directory_competition_categories_directory_competition_id_fkey" FOREIGN KEY (directory_competition_id) REFERENCES directory_competitions(id) not valid;

alter table "public"."directory_competition_categories" validate constraint "directory_competition_categories_directory_competition_id_fkey";

alter table "public"."directory_competitions" add constraint "directory_competitions_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES competitions(id) not valid;

alter table "public"."directory_competitions" validate constraint "directory_competitions_competition_id_fkey";

alter table "public"."entries" add constraint "entries_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."entries" validate constraint "entries_team_id_fkey";

alter table "public"."entries" add constraint "entries_ticket_type_id_fkey" FOREIGN KEY (ticket_type_id) REFERENCES ticket_types(id) not valid;

alter table "public"."entries" validate constraint "entries_ticket_type_id_fkey";

alter table "public"."partner_interests" add constraint "partner_interests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."partner_interests" validate constraint "partner_interests_user_id_fkey";

alter table "public"."partner_requests" add constraint "partner_requests_from_interest_id_fkey" FOREIGN KEY (from_interest_id) REFERENCES partner_interests(id) not valid;

alter table "public"."partner_requests" validate constraint "partner_requests_from_interest_id_fkey";

alter table "public"."partner_requests" add constraint "partner_requests_from_user_id_fkey" FOREIGN KEY (from_user_id) REFERENCES users(id) not valid;

alter table "public"."partner_requests" validate constraint "partner_requests_from_user_id_fkey";

alter table "public"."partner_requests" add constraint "partner_requests_to_interest_id_fkey" FOREIGN KEY (to_interest_id) REFERENCES partner_interests(id) not valid;

alter table "public"."partner_requests" validate constraint "partner_requests_to_interest_id_fkey";

alter table "public"."team_members" add constraint "team_members_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) not valid;

alter table "public"."team_members" validate constraint "team_members_team_id_fkey";

alter table "public"."team_members" add constraint "team_members_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) not valid;

alter table "public"."team_members" validate constraint "team_members_user_id_fkey";

alter table "public"."teams" add constraint "teams_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES competitions(id) not valid;

alter table "public"."teams" validate constraint "teams_competition_id_fkey";

alter table "public"."ticket_types" add constraint "ticket_types_competition_id_fkey" FOREIGN KEY (competition_id) REFERENCES competitions(id) not valid;

alter table "public"."ticket_types" validate constraint "ticket_types_competition_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_as_json_by_email(p_email text)
 RETURNS json
 LANGUAGE plpgsql
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    v_user_json JSON;
BEGIN
    SELECT row_to_json(u) INTO v_user_json FROM auth.users u WHERE u.email = p_email;
    RETURN v_user_json;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public', 'auth'
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    RETURN v_user_id;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.reinsert_registrants_to_heats(competition_id text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    reg RECORD;
    workout RECORD;
    score_setting RECORD;
    heat RECORD;
    lane_count INTEGER;
    new_heat_id TEXT;
    new_lane_number INTEGER;
    entry_id UUID;
BEGIN
    -- Get score settings
    SELECT * INTO score_setting FROM "ScoreSetting" WHERE "competitionId" = competition_id;

    -- Loop through all registrations
    FOR reg IN (SELECT r.*, tt."teamSize", tt."isVolunteer" 
                FROM "Registration" r
                JOIN "TicketType" tt ON r."ticketTypeId" = tt.id
                WHERE r."competitionId" = competition_id)
    LOOP
        -- Skip volunteers
        IF reg."isVolunteer" THEN
            CONTINUE;
        END IF;

        -- Get or create entry
        INSERT INTO "Entry" ("userId", "ticketTypeId")
        VALUES (reg."userId", reg."ticketTypeId")
        ON CONFLICT ("userId", "ticketTypeId") 
        DO UPDATE SET "updatedAt" = CURRENT_TIMESTAMP
        RETURNING id INTO entry_id;

        -- Loop through all workouts
        FOR workout IN (SELECT * FROM "Workout" WHERE "competitionId" = competition_id)
        LOOP
            -- Find an available heat or create a new one
            SELECT h.* INTO heat
            FROM "Heat" h
            LEFT JOIN "Lane" l ON h.id = l."heatId"
            WHERE h."workoutId" = workout.id AND h."ticketTypeId" = reg."ticketTypeId"
            GROUP BY h.id
            HAVING COUNT(l.id) < score_setting.lanes
            ORDER BY h."startTime"
            LIMIT 1;

            IF heat.id IS NULL THEN
                -- Create a new heat
                INSERT INTO "Heat" ("workoutId", "ticketTypeId", "startTime", "maxEntriesPerHeat")
                VALUES (workout.id, reg."ticketTypeId", 
                        COALESCE((SELECT MAX("startTime") FROM "Heat" WHERE "workoutId" = workout.id), workout."releaseDateTime") + 
                        (score_setting."heatsEveryXMinutes" || ' minutes')::INTERVAL,
                        score_setting.lanes)
                RETURNING id, "startTime" INTO new_heat_id, heat."startTime";
                heat.id := new_heat_id;
            END IF;

            -- Insert lane
            SELECT COALESCE(MAX("number"), 0) + 1 INTO new_lane_number
            FROM "Lane"
            WHERE "heatId" = heat.id;

            INSERT INTO "Lane" ("entryId", "heatId", "number")
            VALUES (entry_id, heat.id, new_lane_number);
        END LOOP;
    END LOOP;
END;
$function$
;

grant delete on table "public"."Address" to "service_role";

grant insert on table "public"."Address" to "service_role";

grant references on table "public"."Address" to "service_role";

grant select on table "public"."Address" to "service_role";

grant trigger on table "public"."Address" to "service_role";

grant truncate on table "public"."Address" to "service_role";

grant update on table "public"."Address" to "service_role";

grant delete on table "public"."Category" to "service_role";

grant insert on table "public"."Category" to "service_role";

grant references on table "public"."Category" to "service_role";

grant select on table "public"."Category" to "service_role";

grant trigger on table "public"."Category" to "service_role";

grant truncate on table "public"."Category" to "service_role";

grant update on table "public"."Category" to "service_role";

grant delete on table "public"."Competition" to "service_role";

grant insert on table "public"."Competition" to "service_role";

grant references on table "public"."Competition" to "service_role";

grant select on table "public"."Competition" to "service_role";

grant trigger on table "public"."Competition" to "service_role";

grant truncate on table "public"."Competition" to "service_role";

grant update on table "public"."Competition" to "service_role";

grant delete on table "public"."DirectoryComp" to "service_role";

grant insert on table "public"."DirectoryComp" to "service_role";

grant references on table "public"."DirectoryComp" to "service_role";

grant select on table "public"."DirectoryComp" to "service_role";

grant trigger on table "public"."DirectoryComp" to "service_role";

grant truncate on table "public"."DirectoryComp" to "service_role";

grant update on table "public"."DirectoryComp" to "service_role";

grant delete on table "public"."EarlyBird" to "service_role";

grant insert on table "public"."EarlyBird" to "service_role";

grant references on table "public"."EarlyBird" to "service_role";

grant select on table "public"."EarlyBird" to "service_role";

grant trigger on table "public"."EarlyBird" to "service_role";

grant truncate on table "public"."EarlyBird" to "service_role";

grant update on table "public"."EarlyBird" to "service_role";

grant delete on table "public"."Entry" to "service_role";

grant insert on table "public"."Entry" to "service_role";

grant references on table "public"."Entry" to "service_role";

grant select on table "public"."Entry" to "service_role";

grant trigger on table "public"."Entry" to "service_role";

grant truncate on table "public"."Entry" to "service_role";

grant update on table "public"."Entry" to "service_role";

grant delete on table "public"."Feedback" to "service_role";

grant insert on table "public"."Feedback" to "service_role";

grant references on table "public"."Feedback" to "service_role";

grant select on table "public"."Feedback" to "service_role";

grant trigger on table "public"."Feedback" to "service_role";

grant truncate on table "public"."Feedback" to "service_role";

grant update on table "public"."Feedback" to "service_role";

grant delete on table "public"."Heat" to "service_role";

grant insert on table "public"."Heat" to "service_role";

grant references on table "public"."Heat" to "service_role";

grant select on table "public"."Heat" to "service_role";

grant trigger on table "public"."Heat" to "service_role";

grant truncate on table "public"."Heat" to "service_role";

grant update on table "public"."Heat" to "service_role";

grant delete on table "public"."HeatTicketTypes" to "service_role";

grant insert on table "public"."HeatTicketTypes" to "service_role";

grant references on table "public"."HeatTicketTypes" to "service_role";

grant select on table "public"."HeatTicketTypes" to "service_role";

grant trigger on table "public"."HeatTicketTypes" to "service_role";

grant truncate on table "public"."HeatTicketTypes" to "service_role";

grant update on table "public"."HeatTicketTypes" to "service_role";

grant delete on table "public"."Invitation" to "service_role";

grant insert on table "public"."Invitation" to "service_role";

grant references on table "public"."Invitation" to "service_role";

grant select on table "public"."Invitation" to "service_role";

grant trigger on table "public"."Invitation" to "service_role";

grant truncate on table "public"."Invitation" to "service_role";

grant update on table "public"."Invitation" to "service_role";

grant delete on table "public"."Lane" to "service_role";

grant insert on table "public"."Lane" to "service_role";

grant references on table "public"."Lane" to "service_role";

grant select on table "public"."Lane" to "service_role";

grant trigger on table "public"."Lane" to "service_role";

grant truncate on table "public"."Lane" to "service_role";

grant update on table "public"."Lane" to "service_role";

grant delete on table "public"."NotificationSubscription" to "service_role";

grant insert on table "public"."NotificationSubscription" to "service_role";

grant references on table "public"."NotificationSubscription" to "service_role";

grant select on table "public"."NotificationSubscription" to "service_role";

grant trigger on table "public"."NotificationSubscription" to "service_role";

grant truncate on table "public"."NotificationSubscription" to "service_role";

grant update on table "public"."NotificationSubscription" to "service_role";

grant delete on table "public"."Org" to "service_role";

grant insert on table "public"."Org" to "service_role";

grant references on table "public"."Org" to "service_role";

grant select on table "public"."Org" to "service_role";

grant trigger on table "public"."Org" to "service_role";

grant truncate on table "public"."Org" to "service_role";

grant update on table "public"."Org" to "service_role";

grant delete on table "public"."Payment" to "service_role";

grant insert on table "public"."Payment" to "service_role";

grant references on table "public"."Payment" to "service_role";

grant select on table "public"."Payment" to "service_role";

grant trigger on table "public"."Payment" to "service_role";

grant truncate on table "public"."Payment" to "service_role";

grant update on table "public"."Payment" to "service_role";

grant delete on table "public"."Referral" to "service_role";

grant insert on table "public"."Referral" to "service_role";

grant references on table "public"."Referral" to "service_role";

grant select on table "public"."Referral" to "service_role";

grant trigger on table "public"."Referral" to "service_role";

grant truncate on table "public"."Referral" to "service_role";

grant update on table "public"."Referral" to "service_role";

grant delete on table "public"."Registration" to "service_role";

grant insert on table "public"."Registration" to "service_role";

grant references on table "public"."Registration" to "service_role";

grant select on table "public"."Registration" to "service_role";

grant trigger on table "public"."Registration" to "service_role";

grant truncate on table "public"."Registration" to "service_role";

grant update on table "public"."Registration" to "service_role";

grant delete on table "public"."RegistrationAnswer" to "service_role";

grant insert on table "public"."RegistrationAnswer" to "service_role";

grant references on table "public"."RegistrationAnswer" to "service_role";

grant select on table "public"."RegistrationAnswer" to "service_role";

grant trigger on table "public"."RegistrationAnswer" to "service_role";

grant truncate on table "public"."RegistrationAnswer" to "service_role";

grant update on table "public"."RegistrationAnswer" to "service_role";

grant delete on table "public"."RegistrationField" to "service_role";

grant insert on table "public"."RegistrationField" to "service_role";

grant references on table "public"."RegistrationField" to "service_role";

grant select on table "public"."RegistrationField" to "service_role";

grant trigger on table "public"."RegistrationField" to "service_role";

grant truncate on table "public"."RegistrationField" to "service_role";

grant update on table "public"."RegistrationField" to "service_role";

grant delete on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant insert on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant references on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant select on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant trigger on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant truncate on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant update on table "public"."RegistrationFieldTicketTypes" to "service_role";

grant delete on table "public"."Score" to "service_role";

grant insert on table "public"."Score" to "service_role";

grant references on table "public"."Score" to "service_role";

grant select on table "public"."Score" to "service_role";

grant trigger on table "public"."Score" to "service_role";

grant truncate on table "public"."Score" to "service_role";

grant update on table "public"."Score" to "service_role";

grant delete on table "public"."ScoreSetting" to "service_role";

grant insert on table "public"."ScoreSetting" to "service_role";

grant references on table "public"."ScoreSetting" to "service_role";

grant select on table "public"."ScoreSetting" to "service_role";

grant trigger on table "public"."ScoreSetting" to "service_role";

grant truncate on table "public"."ScoreSetting" to "service_role";

grant update on table "public"."ScoreSetting" to "service_role";

grant delete on table "public"."SentEmail" to "service_role";

grant insert on table "public"."SentEmail" to "service_role";

grant references on table "public"."SentEmail" to "service_role";

grant select on table "public"."SentEmail" to "service_role";

grant trigger on table "public"."SentEmail" to "service_role";

grant truncate on table "public"."SentEmail" to "service_role";

grant update on table "public"."SentEmail" to "service_role";

grant delete on table "public"."Team" to "service_role";

grant insert on table "public"."Team" to "service_role";

grant references on table "public"."Team" to "service_role";

grant select on table "public"."Team" to "service_role";

grant trigger on table "public"."Team" to "service_role";

grant truncate on table "public"."Team" to "service_role";

grant update on table "public"."Team" to "service_role";

grant delete on table "public"."TeamMember" to "service_role";

grant insert on table "public"."TeamMember" to "service_role";

grant references on table "public"."TeamMember" to "service_role";

grant select on table "public"."TeamMember" to "service_role";

grant trigger on table "public"."TeamMember" to "service_role";

grant truncate on table "public"."TeamMember" to "service_role";

grant update on table "public"."TeamMember" to "service_role";

grant delete on table "public"."TicketType" to "service_role";

grant insert on table "public"."TicketType" to "service_role";

grant references on table "public"."TicketType" to "service_role";

grant select on table "public"."TicketType" to "service_role";

grant trigger on table "public"."TicketType" to "service_role";

grant truncate on table "public"."TicketType" to "service_role";

grant update on table "public"."TicketType" to "service_role";

grant delete on table "public"."User" to "service_role";

grant insert on table "public"."User" to "service_role";

grant references on table "public"."User" to "service_role";

grant select on table "public"."User" to "service_role";

grant trigger on table "public"."User" to "service_role";

grant truncate on table "public"."User" to "service_role";

grant update on table "public"."User" to "service_role";

grant delete on table "public"."Workout" to "service_role";

grant insert on table "public"."Workout" to "service_role";

grant references on table "public"."Workout" to "service_role";

grant select on table "public"."Workout" to "service_role";

grant trigger on table "public"."Workout" to "service_role";

grant truncate on table "public"."Workout" to "service_role";

grant update on table "public"."Workout" to "service_role";

grant delete on table "public"."migrations" to "service_role";

grant insert on table "public"."migrations" to "service_role";

grant references on table "public"."migrations" to "service_role";

grant select on table "public"."migrations" to "service_role";

grant trigger on table "public"."migrations" to "service_role";

grant truncate on table "public"."migrations" to "service_role";

grant update on table "public"."migrations" to "service_role";


