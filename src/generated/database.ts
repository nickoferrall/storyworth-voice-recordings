import type { ColumnType } from "kysely";

export type AuthAalLevel = "aal1" | "aal2" | "aal3";

export type AuthCodeChallengeMethod = "plain" | "s256";

export type AuthFactorStatus = "unverified" | "verified";

export type AuthFactorType = "phone" | "totp" | "webauthn";

export type AuthOneTimeTokenType = "confirmation_token" | "email_change_token_current" | "email_change_token_new" | "phone_change_token" | "reauthentication_token" | "recovery_token";

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;

export type Int8 = ColumnType<string, bigint | number | string, bigint | number | string>;

export type Json = JsonValue;

export type JsonArray = JsonValue[];

export type JsonObject = {
  [K in string]?: JsonValue;
};

export type JsonPrimitive = boolean | number | string | null;

export type JsonValue = JsonArray | JsonObject | JsonPrimitive;

export type Numeric = ColumnType<string, number | string, number | string>;

export type PgsodiumKeyStatus = "default" | "expired" | "invalid" | "valid";

export type PgsodiumKeyType = "aead-det" | "aead-ietf" | "auth" | "generichash" | "hmacsha256" | "hmacsha512" | "kdf" | "secretbox" | "secretstream" | "shorthash" | "stream_xchacha20";

export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface Address {
  city: string | null;
  country: string | null;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  postcode: string | null;
  street: string | null;
  updatedAt: Generated<Timestamp>;
  venue: string | null;
}

export interface Addresses {
  city: string | null;
  competition_id: string | null;
  country: string | null;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  venue: string | null;
}

export interface AthleteCompetition {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface AuthAuditLogEntries {
  created_at: Timestamp | null;
  id: string;
  instance_id: string | null;
  ip_address: Generated<string>;
  payload: Json | null;
}

export interface AuthFlowState {
  auth_code: string;
  auth_code_issued_at: Timestamp | null;
  authentication_method: string;
  code_challenge: string;
  code_challenge_method: AuthCodeChallengeMethod;
  created_at: Timestamp | null;
  id: string;
  provider_access_token: string | null;
  provider_refresh_token: string | null;
  provider_type: string;
  updated_at: Timestamp | null;
  user_id: string | null;
}

export interface AuthIdentities {
  created_at: Timestamp | null;
  /**
   * Auth: Email is a generated column that references the optional email property in the identity_data
   */
  email: Generated<string | null>;
  id: Generated<string>;
  identity_data: Json;
  last_sign_in_at: Timestamp | null;
  provider: string;
  provider_id: string;
  updated_at: Timestamp | null;
  user_id: string;
}

export interface AuthInstances {
  created_at: Timestamp | null;
  id: string;
  raw_base_config: string | null;
  updated_at: Timestamp | null;
  uuid: string | null;
}

export interface AuthMfaAmrClaims {
  authentication_method: string;
  created_at: Timestamp;
  id: string;
  session_id: string;
  updated_at: Timestamp;
}

export interface AuthMfaChallenges {
  created_at: Timestamp;
  factor_id: string;
  id: string;
  ip_address: string;
  otp_code: string | null;
  verified_at: Timestamp | null;
  web_authn_session_data: Json | null;
}

export interface AuthMfaFactors {
  created_at: Timestamp;
  factor_type: AuthFactorType;
  friendly_name: string | null;
  id: string;
  last_challenged_at: Timestamp | null;
  phone: string | null;
  secret: string | null;
  status: AuthFactorStatus;
  updated_at: Timestamp;
  user_id: string;
  web_authn_aaguid: string | null;
  web_authn_credential: Json | null;
}

export interface AuthOneTimeTokens {
  created_at: Generated<Timestamp>;
  id: string;
  relates_to: string;
  token_hash: string;
  token_type: AuthOneTimeTokenType;
  updated_at: Generated<Timestamp>;
  user_id: string;
}

export interface AuthRefreshTokens {
  created_at: Timestamp | null;
  id: Generated<Int8>;
  instance_id: string | null;
  parent: string | null;
  revoked: boolean | null;
  session_id: string | null;
  token: string | null;
  updated_at: Timestamp | null;
  user_id: string | null;
}

export interface AuthSamlProviders {
  attribute_mapping: Json | null;
  created_at: Timestamp | null;
  entity_id: string;
  id: string;
  metadata_url: string | null;
  metadata_xml: string;
  name_id_format: string | null;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSamlRelayStates {
  created_at: Timestamp | null;
  flow_state_id: string | null;
  for_email: string | null;
  id: string;
  redirect_to: string | null;
  request_id: string;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSchemaMigrations {
  version: string;
}

export interface AuthSessions {
  aal: AuthAalLevel | null;
  created_at: Timestamp | null;
  factor_id: string | null;
  id: string;
  ip: string | null;
  /**
   * Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.
   */
  not_after: Timestamp | null;
  refreshed_at: Timestamp | null;
  tag: string | null;
  updated_at: Timestamp | null;
  user_agent: string | null;
  user_id: string;
}

export interface AuthSsoDomains {
  created_at: Timestamp | null;
  domain: string;
  id: string;
  sso_provider_id: string;
  updated_at: Timestamp | null;
}

export interface AuthSsoProviders {
  created_at: Timestamp | null;
  id: string;
  /**
   * Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.
   */
  resource_id: string | null;
  updated_at: Timestamp | null;
}

export interface AuthUsers {
  aud: string | null;
  banned_until: Timestamp | null;
  confirmation_sent_at: Timestamp | null;
  confirmation_token: string | null;
  confirmed_at: Generated<Timestamp | null>;
  created_at: Timestamp | null;
  deleted_at: Timestamp | null;
  email: string | null;
  email_change: string | null;
  email_change_confirm_status: Generated<number | null>;
  email_change_sent_at: Timestamp | null;
  email_change_token_current: Generated<string | null>;
  email_change_token_new: string | null;
  email_confirmed_at: Timestamp | null;
  encrypted_password: string | null;
  id: string;
  instance_id: string | null;
  invited_at: Timestamp | null;
  is_anonymous: Generated<boolean>;
  /**
   * Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.
   */
  is_sso_user: Generated<boolean>;
  is_super_admin: boolean | null;
  last_sign_in_at: Timestamp | null;
  phone: Generated<string | null>;
  phone_change: Generated<string | null>;
  phone_change_sent_at: Timestamp | null;
  phone_change_token: Generated<string | null>;
  phone_confirmed_at: Timestamp | null;
  raw_app_meta_data: Json | null;
  raw_user_meta_data: Json | null;
  reauthentication_sent_at: Timestamp | null;
  reauthentication_token: Generated<string | null>;
  recovery_sent_at: Timestamp | null;
  recovery_token: string | null;
  role: string | null;
  updated_at: Timestamp | null;
}

export interface Category {
  createdAt: Generated<Timestamp>;
  difficulty: "ELITE" | "EVERYDAY" | "INTERMEDIATE" | "MASTERS" | "OPEN" | "RX" | "SCALED" | "TEEN";
  directoryCompId: string;
  gender: "FEMALE" | "MALE" | "MIXED";
  id: string;
  isSoldOut: Generated<boolean>;
  price: Numeric | null;
  tags: string[] | null;
  teamSize: number;
  updatedAt: Generated<Timestamp>;
}

export interface Competition {
  addressId: string | null;
  country: string | null;
  createdAt: Generated<Timestamp>;
  createdByUserId: string | null;
  ctaLink: string | null;
  currency: string | null;
  description: string | null;
  difficulty: "ELITE" | "EVERYDAY" | "INTERMEDIATE" | "MASTERS" | "OPEN" | "RX" | "SCALED" | "TEEN" | null;
  directoryCompId: string | null;
  email: string | null;
  endDateTime: Timestamp | null;
  externalUrl: string | null;
  gender: "FEMALE" | "MALE" | "MIXED" | null;
  id: string;
  instagramHandle: string | null;
  isActive: Generated<boolean>;
  logo: string | null;
  name: string;
  orgId: string | null;
  orgName: string | null;
  price: Numeric | null;
  region: string | null;
  registrationEnabled: Generated<boolean>;
  source: Generated<string>;
  startDateTime: Timestamp;
  state: string | null;
  teamSize: string | null;
  testField: string | null;
  ticketWebsite: string | null;
  timezone: string | null;
  types: string[] | null;
  updatedAt: Generated<Timestamp>;
  website: string | null;
}

export interface CompetitionCreator {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface CompetitionEditSuggestion {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  reason: string | null;
  reviewedAt: Timestamp | null;
  reviewedBy: string | null;
  status: Generated<string>;
  suggestedChanges: Json;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface CompetitionInvitation {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  email: string;
  id: Generated<string>;
  sentByUserId: string;
  status: Generated<"ACCEPTED" | "EXPIRED" | "PENDING" | "REVOKED">;
  token: string;
  updatedAt: Generated<Timestamp>;
}

export interface Competitions {
  created_at: Generated<Timestamp | null>;
  description: string | null;
  end_date_time: Timestamp | null;
  has_workouts: Generated<boolean | null>;
  id: string;
  is_active: Generated<boolean | null>;
  name: string;
  release_date_time: Timestamp | null;
  start_date_time: Timestamp | null;
  timezone: Generated<string | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface DirectoryComp {
  competitionId: string | null;
  country: string;
  createdAt: Generated<Timestamp>;
  ctaLink: string | null;
  currency: string | null;
  description: string | null;
  email: string | null;
  endDate: Timestamp | null;
  id: string;
  instagramHandle: string | null;
  location: string;
  logo: string | null;
  price: Numeric | null;
  region: string | null;
  startDate: Timestamp;
  state: string | null;
  teamSize: string | null;
  ticketWebsite: string | null;
  title: string;
  type: Generated<"CROSSFIT" | "HYROX" | "HYROX_SIMULATION" | "OTHER">;
  updatedAt: Generated<Timestamp>;
  website: string | null;
}

export interface DirectoryCompetitionCategories {
  created_at: Generated<Timestamp | null>;
  difficulty: string | null;
  directory_competition_id: string | null;
  gender: string | null;
  id: Generated<string>;
  team_size: number | null;
}

export interface DirectoryCompetitions {
  competition_id: string | null;
  country: string | null;
  created_at: Generated<Timestamp | null>;
  end_date: Timestamp | null;
  id: string;
  location: string | null;
  start_date: Timestamp | null;
  title: string;
  updated_at: Generated<Timestamp | null>;
}

export interface EarlyBird {
  createdAt: Generated<Timestamp>;
  endDateTime: Timestamp | null;
  id: Generated<string>;
  limit: number | null;
  price: number;
  startDateTime: Timestamp | null;
  ticketTypeId: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface Entries {
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  invitation_token: string | null;
  team_id: string | null;
  ticket_type_id: string | null;
  updated_at: Generated<Timestamp | null>;
}

export interface Entry {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  teamId: string | null;
  ticketTypeId: string;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface ExtensionsPgStatStatements {
  blk_read_time: number | null;
  blk_write_time: number | null;
  calls: Int8 | null;
  dbid: number | null;
  jit_emission_count: Int8 | null;
  jit_emission_time: number | null;
  jit_functions: Int8 | null;
  jit_generation_time: number | null;
  jit_inlining_count: Int8 | null;
  jit_inlining_time: number | null;
  jit_optimization_count: Int8 | null;
  jit_optimization_time: number | null;
  local_blks_dirtied: Int8 | null;
  local_blks_hit: Int8 | null;
  local_blks_read: Int8 | null;
  local_blks_written: Int8 | null;
  max_exec_time: number | null;
  max_plan_time: number | null;
  mean_exec_time: number | null;
  mean_plan_time: number | null;
  min_exec_time: number | null;
  min_plan_time: number | null;
  plans: Int8 | null;
  query: string | null;
  queryid: Int8 | null;
  rows: Int8 | null;
  shared_blks_dirtied: Int8 | null;
  shared_blks_hit: Int8 | null;
  shared_blks_read: Int8 | null;
  shared_blks_written: Int8 | null;
  stddev_exec_time: number | null;
  stddev_plan_time: number | null;
  temp_blk_read_time: number | null;
  temp_blk_write_time: number | null;
  temp_blks_read: Int8 | null;
  temp_blks_written: Int8 | null;
  toplevel: boolean | null;
  total_exec_time: number | null;
  total_plan_time: number | null;
  userid: number | null;
  wal_bytes: Numeric | null;
  wal_fpi: Int8 | null;
  wal_records: Int8 | null;
}

export interface ExtensionsPgStatStatementsInfo {
  dealloc: Int8 | null;
  stats_reset: Timestamp | null;
}

export interface Feedback {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  text: string;
  userId: string | null;
}

export interface Heat {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  maxLimitPerHeat: number;
  startTime: Timestamp;
  updatedAt: Generated<Timestamp>;
  workoutId: string;
}

export interface HeatTicketTypes {
  heatId: string;
  ticketTypeId: string;
}

export interface Integration {
  accessToken: string;
  athleteFirstname: string | null;
  athleteId: string;
  athleteLastname: string | null;
  athleteProfile: string | null;
  createdAt: Generated<Timestamp>;
  expiresAt: Timestamp;
  id: Generated<string>;
  refreshToken: string;
  registrationAnswerId: string;
  type: string;
  updatedAt: Generated<Timestamp>;
}

export interface Invitation {
  createdAt: Generated<Timestamp>;
  email: string | null;
  id: Generated<string>;
  sentByUserId: string | null;
  status: Generated<"ACCEPTED" | "EXPIRED" | "PENDING" | "REVOKED">;
  teamId: string;
  token: string;
  updatedAt: Generated<Timestamp>;
}

export interface Lane {
  createdAt: Generated<Timestamp>;
  entryId: string;
  heatId: string;
  id: Generated<string>;
  number: number;
  updatedAt: Generated<Timestamp>;
}

export interface Migrations {
  executed_at: Generated<Timestamp | null>;
  id: Generated<number>;
  name: string;
}

export interface NotificationSubscription {
  countries: Generated<string[] | null>;
  createdAt: Generated<Timestamp>;
  difficulty: string | null;
  email: string;
  eventType: string | null;
  gender: string | null;
  id: Generated<string>;
  locations: Generated<string[] | null>;
  tags: Generated<string[] | null>;
  teamSize: string | null;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface Org {
  contactNumber: string | null;
  createdAt: Generated<Timestamp>;
  description: string | null;
  email: string;
  facebook: string | null;
  id: Generated<string>;
  instagram: string | null;
  logo: string | null;
  name: string;
  twitter: string | null;
  updatedAt: Generated<Timestamp>;
  website: string | null;
  youtube: string | null;
}

export interface PartnerInterest {
  categoryId: string | null;
  createdAt: Generated<Timestamp>;
  description: string | null;
  id: Generated<string>;
  instagram: string | null;
  interestType: string;
  partnerPreference: string;
  phone: string | null;
  status: string;
  ticketTypeId: string | null;
  updatedAt: Generated<Timestamp>;
  userId: string;
}

export interface PartnerInterests {
  category_id: string | null;
  created_at: Generated<Timestamp | null>;
  description: string | null;
  directory_comp_id: string | null;
  id: Generated<string>;
  phone: string | null;
  status: Generated<string | null>;
  updated_at: Generated<Timestamp | null>;
  user_id: string | null;
}

export interface PartnerInterestTeamMember {
  createdAt: Generated<Timestamp>;
  email: string;
  id: Generated<string>;
  invitationToken: string | null;
  name: string;
  partnerInterestId: string;
  status: Generated<"ACCEPTED" | "INVITED" | "REJECTED">;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface PartnerRequest {
  createdAt: Generated<Timestamp>;
  fromInterestId: string | null;
  fromUserId: string | null;
  id: Generated<string>;
  instagram: string | null;
  message: string | null;
  phone: string | null;
  status: Generated<"ACCEPTED" | "CANCELLED" | "PENDING" | "REJECTED">;
  toInterestId: string;
  updatedAt: Generated<Timestamp>;
}

export interface PartnerRequests {
  created_at: Generated<Timestamp | null>;
  from_interest_id: string | null;
  from_user_id: string | null;
  id: Generated<string>;
  message: string | null;
  phone: string | null;
  status: Generated<string | null>;
  to_interest_id: string | null;
  updated_at: Generated<Timestamp | null>;
}

export interface Payment {
  amount: number;
  createdAt: Generated<Timestamp>;
  currency: string;
  customerId: string;
  id: Generated<string>;
  paymentIntentId: string;
  registrationId: string;
  status: string;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface PgsodiumDecryptedKey {
  associated_data: string | null;
  comment: string | null;
  created: Timestamp | null;
  decrypted_raw_key: Buffer | null;
  expires: Timestamp | null;
  id: string | null;
  key_context: Buffer | null;
  key_id: Int8 | null;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  parent_key: string | null;
  raw_key: Buffer | null;
  raw_key_nonce: Buffer | null;
  status: PgsodiumKeyStatus | null;
}

export interface PgsodiumKey {
  associated_data: Generated<string | null>;
  comment: string | null;
  created: Generated<Timestamp>;
  expires: Timestamp | null;
  id: Generated<string>;
  key_context: Generated<Buffer | null>;
  key_id: Generated<Int8 | null>;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  parent_key: string | null;
  raw_key: Buffer | null;
  raw_key_nonce: Buffer | null;
  status: Generated<PgsodiumKeyStatus | null>;
  user_data: string | null;
}

export interface PgsodiumMaskColumns {
  associated_columns: string | null;
  attname: string | null;
  attrelid: number | null;
  format_type: string | null;
  key_id: string | null;
  key_id_column: string | null;
  nonce_column: string | null;
}

export interface PgsodiumMaskingRule {
  associated_columns: string | null;
  attname: string | null;
  attnum: number | null;
  attrelid: number | null;
  col_description: string | null;
  format_type: string | null;
  key_id: string | null;
  key_id_column: string | null;
  nonce_column: string | null;
  priority: number | null;
  relname: string | null;
  relnamespace: string | null;
  security_invoker: boolean | null;
  view_name: string | null;
}

export interface PgsodiumValidKey {
  associated_data: string | null;
  created: Timestamp | null;
  expires: Timestamp | null;
  id: string | null;
  key_context: Buffer | null;
  key_id: Int8 | null;
  key_type: PgsodiumKeyType | null;
  name: string | null;
  status: PgsodiumKeyStatus | null;
}

export interface PotentialCompetition {
  addressId: string | null;
  country: string | null;
  createdAt: Generated<Timestamp>;
  currency: string | null;
  description: string | null;
  email: string | null;
  endDateTime: Timestamp | null;
  id: Generated<string>;
  instagramHandle: string | null;
  logo: string | null;
  name: string;
  orgName: string | null;
  price: Numeric | null;
  region: string | null;
  reviewedAt: Timestamp | null;
  reviewedBy: string | null;
  scrapedData: Json | null;
  source: string;
  startDateTime: Timestamp;
  state: string | null;
  status: Generated<string>;
  timezone: string | null;
  updatedAt: Generated<Timestamp>;
  website: string | null;
}

export interface PotentialTicketType {
  allowHeatSelection: Generated<boolean>;
  createdAt: Generated<Timestamp>;
  currency: string | null;
  description: string | null;
  id: Generated<string>;
  isVolunteer: Generated<boolean>;
  maxEntries: number;
  name: string;
  passOnPlatformFee: Generated<boolean>;
  potentialCompetitionId: string;
  price: Numeric;
  teamSize: number;
  updatedAt: Generated<Timestamp>;
}

export interface RealtimeMessages {
  event: string | null;
  extension: string;
  id: Generated<string>;
  inserted_at: Generated<Timestamp>;
  payload: Json | null;
  private: Generated<boolean | null>;
  topic: string;
  updated_at: Generated<Timestamp>;
}

export interface RealtimeSchemaMigrations {
  inserted_at: Timestamp | null;
  version: Int8;
}

export interface RealtimeSubscription {
  claims: Json;
  claims_role: Generated<string>;
  created_at: Generated<Timestamp>;
  entity: string;
  filters: Generated<string[]>;
  id: Generated<Int8>;
  subscription_id: string;
}

export interface Referral {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  referredId: string | null;
  referrerId: string | null;
}

export interface Registration {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  isCheckedIn: Generated<boolean>;
  ticketTypeId: string;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface RegistrationAnswer {
  answer: string;
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  registrationFieldId: string;
  registrationId: string;
  updatedAt: Generated<Timestamp>;
}

export interface RegistrationField {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  isEditable: boolean;
  onlyTeams: Generated<boolean>;
  options: string[] | null;
  question: string;
  repeatPerAthlete: Generated<boolean>;
  requiredStatus: "OFF" | "OPTIONAL" | "REQUIRED";
  sortOrder: number;
  type: "DROPDOWN" | "EMAIL" | "INTEGRATION" | "MULTIPLE_CHOICE" | "MULTIPLE_CHOICE_SELECT_ONE" | "STATEMENT" | "TEXT";
  updatedAt: Generated<Timestamp>;
}

export interface RegistrationFieldTicketTypes {
  id: Generated<string>;
  registrationFieldId: string;
  ticketTypeId: string;
}

export interface Score {
  createdAt: Generated<Timestamp>;
  entryId: string;
  id: Generated<string>;
  isCompleted: Generated<boolean>;
  note: string | null;
  scorecard: string | null;
  updatedAt: Generated<Timestamp>;
  value: string;
  workoutId: string;
}

export interface ScoreSetting {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  handleTie: "BEST_OVERALL_FINISH" | "NONE" | "SPECIFIC_WORKOUT";
  heatLimitType: Generated<"ATHLETES" | "ENTRIES">;
  heatsEveryXMinutes: Generated<number>;
  id: Generated<string>;
  maxLimitPerHeat: Generated<number>;
  oneTicketPerHeat: Generated<boolean>;
  penalizeIncomplete: Generated<boolean>;
  penalizeScaled: Generated<boolean>;
  scoring: "CUMULATIVE_UNITS" | "POINT_BASED" | "POINTS_PER_PLACE";
  ticketTypeOrderIds: Generated<string[]>;
  totalHeatsPerWorkout: number | null;
  updatedAt: Generated<Timestamp>;
}

export interface SentEmail {
  competitionId: string | null;
  id: Generated<string>;
  message: string;
  recipients: string[];
  sentAt: Generated<Timestamp>;
  subject: string;
  userId: string;
}

export interface StorageBuckets {
  allowed_mime_types: string[] | null;
  avif_autodetection: Generated<boolean | null>;
  created_at: Generated<Timestamp | null>;
  file_size_limit: Int8 | null;
  id: string;
  name: string;
  /**
   * Field is deprecated, use owner_id instead
   */
  owner: string | null;
  owner_id: string | null;
  public: Generated<boolean | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface StorageMigrations {
  executed_at: Generated<Timestamp | null>;
  hash: string;
  id: number;
  name: string;
}

export interface StorageObjects {
  bucket_id: string | null;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  last_accessed_at: Generated<Timestamp | null>;
  metadata: Json | null;
  name: string | null;
  /**
   * Field is deprecated, use owner_id instead
   */
  owner: string | null;
  owner_id: string | null;
  path_tokens: Generated<string[] | null>;
  updated_at: Generated<Timestamp | null>;
  user_metadata: Json | null;
  version: string | null;
}

export interface StorageS3MultipartUploads {
  bucket_id: string;
  created_at: Generated<Timestamp>;
  id: string;
  in_progress_size: Generated<Int8>;
  key: string;
  owner_id: string | null;
  upload_signature: string;
  user_metadata: Json | null;
  version: string;
}

export interface StorageS3MultipartUploadsParts {
  bucket_id: string;
  created_at: Generated<Timestamp>;
  etag: string;
  id: Generated<string>;
  key: string;
  owner_id: string | null;
  part_number: number;
  size: Generated<Int8>;
  upload_id: string;
  version: string;
}

export interface SupabaseMigrationsSchemaMigrations {
  name: string | null;
  statements: string[] | null;
  version: string;
}

export interface SupabaseMigrationsSeedFiles {
  hash: string;
  path: string;
}

export interface Team {
  createdAt: Generated<Timestamp>;
  id: Generated<string>;
  name: string | null;
  status: Generated<string>;
  teamCaptainId: string;
  updatedAt: Generated<Timestamp>;
}

export interface TeammateListing {
  competitionId: string | null;
  contactInfo: string;
  country: string | null;
  createdAt: Generated<Timestamp>;
  description: string | null;
  difficulty: "ELITE" | "EVERYDAY" | "INTERMEDIATE" | "MASTERS" | "OPEN" | "RX" | "SCALED" | "TEEN" | null;
  directoryCompId: string | null;
  eventType: string | null;
  expiresAt: Timestamp | null;
  gender: "FEMALE" | "MALE" | "MIXED" | null;
  id: string;
  listingType: "LOOKING_FOR_MEMBERS" | "LOOKING_FOR_TEAM";
  region: string | null;
  status: Generated<"ACTIVE" | "CANCELLED" | "EXPIRED" | "FILLED">;
  targetCategoryId: string | null;
  targetTicketTypeId: string | null;
  teamId: string | null;
  teamSize: number | null;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface TeamMember {
  createdAt: Generated<Timestamp>;
  email: string | null;
  id: Generated<string>;
  status: Generated<"ACCEPTED" | "PENDING" | "REJECTED" | null>;
  teamId: string;
  updatedAt: Generated<Timestamp>;
  userId: string | null;
}

export interface TeamMembers {
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  is_captain: Generated<boolean | null>;
  team_id: string | null;
  user_id: string | null;
}

export interface Teams {
  competition_id: string | null;
  created_at: Generated<Timestamp | null>;
  id: Generated<string>;
  name: string | null;
  status: Generated<string | null>;
  updated_at: Generated<Timestamp | null>;
}

export interface TicketType {
  allowHeatSelection: Generated<boolean>;
  competitionId: string;
  createdAt: Generated<Timestamp>;
  currency: "AED" | "AUD" | "BRL" | "CAD" | "CHF" | "CNY" | "DKK" | "EUR" | "GBP" | "HKD" | "INR" | "JPY" | "MXN" | "NOK" | "NZD" | "SEK" | "SGD" | "THB" | "USD" | "ZAR" | null;
  description: string | null;
  divisionScoreType: "CUMULATIVE_UNITS" | "POINT_BASED" | "POINTS_PER_PLACE" | null;
  earlyBirdId: string | null;
  id: Generated<string>;
  isVolunteer: Generated<boolean>;
  maxEntries: number;
  maxEntriesPerHeat: number | null;
  name: string;
  passOnPlatformFee: Generated<boolean>;
  price: number;
  refundPolicy: string | null;
  stripePriceId: string | null;
  stripeProductId: string | null;
  teamSize: number;
  updatedAt: Generated<Timestamp>;
}

export interface TicketTypes {
  allow_heat_selection: Generated<boolean | null>;
  competition_id: string;
  created_at: Generated<Timestamp | null>;
  currency: Generated<string | null>;
  has_availability: Generated<boolean | null>;
  id: Generated<string>;
  name: string;
  price: Numeric | null;
  updated_at: Generated<Timestamp | null>;
}

export interface User {
  athleteCompetitionIds: Generated<string[] | null>;
  createdAt: Generated<Timestamp>;
  createdCompetitionIds: Generated<string[] | null>;
  email: string;
  firstName: string;
  hashedPassword: string | null;
  id: Generated<string>;
  invitationId: string | null;
  isSuperUser: Generated<boolean>;
  isVerified: Generated<boolean>;
  lastName: string | null;
  orgId: string | null;
  picture: string | null;
  referralCode: string | null;
  referredBy: string | null;
  stripeCustomerId: string | null;
  updatedAt: Generated<Timestamp>;
  verificationToken: string | null;
}

export interface UserProfile {
  bio: string | null;
  createdAt: Generated<Timestamp>;
  email: string;
  firstName: string;
  id: string;
  isSuperUser: Generated<boolean>;
  isVerified: Generated<boolean>;
  lastName: string | null;
  picture: string | null;
  updatedAt: Generated<Timestamp>;
}

export interface Users {
  bio: string | null;
  created_at: Generated<Timestamp | null>;
  email: string;
  first_name: string | null;
  id: Generated<string>;
  is_super_user: Generated<boolean | null>;
  last_name: string | null;
  phone: string | null;
  picture: string | null;
  updated_at: Generated<Timestamp | null>;
}

export interface VaultDecryptedSecrets {
  created_at: Timestamp | null;
  decrypted_secret: string | null;
  description: string | null;
  id: string | null;
  key_id: string | null;
  name: string | null;
  nonce: Buffer | null;
  secret: string | null;
  updated_at: Timestamp | null;
}

export interface VaultSecrets {
  created_at: Generated<Timestamp>;
  description: Generated<string>;
  id: Generated<string>;
  key_id: Generated<string | null>;
  name: string | null;
  nonce: Generated<Buffer | null>;
  secret: string;
  updated_at: Generated<Timestamp>;
}

export interface Video {
  createdAt: Generated<Timestamp>;
  description: string | null;
  id: Generated<string>;
  orderIndex: Generated<number>;
  title: string;
  updatedAt: Generated<Timestamp>;
  url: string;
  workoutId: string;
}

export interface Workout {
  competitionId: string;
  createdAt: Generated<Timestamp>;
  description: string;
  id: Generated<string>;
  includeStandardsVideo: Generated<boolean>;
  isVisible: Generated<boolean>;
  location: string;
  name: string;
  releaseDateTime: Timestamp;
  scoreType: "REPS_LESS_IS_BETTER" | "REPS_MORE_IS_BETTER" | "REPS_OR_TIME_COMPLETION_BASED" | "TIME_LESS_IS_BETTER" | "TIME_MORE_IS_BETTER" | "WEIGHT_LESS_IS_BETTER" | "WEIGHT_MORE_IS_BETTER";
  timeCap: number | null;
  unitOfMeasurement: "CALORIES" | "FEET" | "KILOGRAMS" | "KILOMETERS" | "METERS" | "MILES" | "MINUTES" | "OTHER" | "PLACEMENT" | "POUNDS" | "REPS" | "ROUND" | "SECONDS";
  updatedAt: Generated<Timestamp>;
}

export interface DB {
  Address: Address;
  addresses: Addresses;
  AthleteCompetition: AthleteCompetition;
  "auth.audit_log_entries": AuthAuditLogEntries;
  "auth.flow_state": AuthFlowState;
  "auth.identities": AuthIdentities;
  "auth.instances": AuthInstances;
  "auth.mfa_amr_claims": AuthMfaAmrClaims;
  "auth.mfa_challenges": AuthMfaChallenges;
  "auth.mfa_factors": AuthMfaFactors;
  "auth.one_time_tokens": AuthOneTimeTokens;
  "auth.refresh_tokens": AuthRefreshTokens;
  "auth.saml_providers": AuthSamlProviders;
  "auth.saml_relay_states": AuthSamlRelayStates;
  "auth.schema_migrations": AuthSchemaMigrations;
  "auth.sessions": AuthSessions;
  "auth.sso_domains": AuthSsoDomains;
  "auth.sso_providers": AuthSsoProviders;
  "auth.users": AuthUsers;
  Category: Category;
  Competition: Competition;
  CompetitionCreator: CompetitionCreator;
  CompetitionEditSuggestion: CompetitionEditSuggestion;
  CompetitionInvitation: CompetitionInvitation;
  competitions: Competitions;
  directory_competition_categories: DirectoryCompetitionCategories;
  directory_competitions: DirectoryCompetitions;
  DirectoryComp: DirectoryComp;
  EarlyBird: EarlyBird;
  entries: Entries;
  Entry: Entry;
  "extensions.pg_stat_statements": ExtensionsPgStatStatements;
  "extensions.pg_stat_statements_info": ExtensionsPgStatStatementsInfo;
  Feedback: Feedback;
  Heat: Heat;
  HeatTicketTypes: HeatTicketTypes;
  Integration: Integration;
  Invitation: Invitation;
  Lane: Lane;
  migrations: Migrations;
  NotificationSubscription: NotificationSubscription;
  Org: Org;
  partner_interests: PartnerInterests;
  partner_requests: PartnerRequests;
  PartnerInterest: PartnerInterest;
  PartnerInterestTeamMember: PartnerInterestTeamMember;
  PartnerRequest: PartnerRequest;
  Payment: Payment;
  "pgsodium.decrypted_key": PgsodiumDecryptedKey;
  "pgsodium.key": PgsodiumKey;
  "pgsodium.mask_columns": PgsodiumMaskColumns;
  "pgsodium.masking_rule": PgsodiumMaskingRule;
  "pgsodium.valid_key": PgsodiumValidKey;
  PotentialCompetition: PotentialCompetition;
  PotentialTicketType: PotentialTicketType;
  "realtime.messages": RealtimeMessages;
  "realtime.schema_migrations": RealtimeSchemaMigrations;
  "realtime.subscription": RealtimeSubscription;
  Referral: Referral;
  Registration: Registration;
  RegistrationAnswer: RegistrationAnswer;
  RegistrationField: RegistrationField;
  RegistrationFieldTicketTypes: RegistrationFieldTicketTypes;
  Score: Score;
  ScoreSetting: ScoreSetting;
  SentEmail: SentEmail;
  "storage.buckets": StorageBuckets;
  "storage.migrations": StorageMigrations;
  "storage.objects": StorageObjects;
  "storage.s3_multipart_uploads": StorageS3MultipartUploads;
  "storage.s3_multipart_uploads_parts": StorageS3MultipartUploadsParts;
  "supabase_migrations.schema_migrations": SupabaseMigrationsSchemaMigrations;
  "supabase_migrations.seed_files": SupabaseMigrationsSeedFiles;
  Team: Team;
  team_members: TeamMembers;
  TeammateListing: TeammateListing;
  TeamMember: TeamMember;
  teams: Teams;
  ticket_types: TicketTypes;
  TicketType: TicketType;
  User: User;
  UserProfile: UserProfile;
  users: Users;
  "vault.decrypted_secrets": VaultDecryptedSecrets;
  "vault.secrets": VaultSecrets;
  Video: Video;
  Workout: Workout;
}
