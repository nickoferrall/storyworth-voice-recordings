CREATE TABLE "public"."CompetitionInvitation" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
    "email" character varying(255) NOT NULL,
    "competitionId" character varying(8) NOT NULL,
    "token" character varying(255) NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "sentByUserId" uuid NOT NULL,
    "createdAt" timestamp with time zone NOT NULL DEFAULT now(),
    "updatedAt" timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE "public"."CompetitionInvitation" ADD CONSTRAINT "CompetitionInvitation_pkey" PRIMARY KEY ("id");

ALTER TABLE "public"."CompetitionInvitation" ADD CONSTRAINT "fk_competition_invitation_competition" 
FOREIGN KEY ("competitionId") REFERENCES "public"."Competition" ("id") ON DELETE CASCADE;

ALTER TABLE "public"."CompetitionInvitation" ADD CONSTRAINT "fk_competition_invitation_user" 
FOREIGN KEY ("sentByUserId") REFERENCES "auth"."users" ("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX "idx_competition_invitation_token" ON "public"."CompetitionInvitation" ("token");
CREATE INDEX "idx_competition_invitation_email" ON "public"."CompetitionInvitation" ("email");
CREATE INDEX "idx_competition_invitation_competition" ON "public"."CompetitionInvitation" ("competitionId");
CREATE INDEX "idx_competition_invitation_status" ON "public"."CompetitionInvitation" ("status"); 