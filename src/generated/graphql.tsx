import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Date and time */
  DateTime: { input: any; output: any; }
  /** Json custom scalar type */
  Json: { input: any; output: any; }
};

export enum Access {
  Private = 'PRIVATE',
  Public = 'PUBLIC'
}

export type AddDirectoryCompCategoryInput = {
  difficulty: Difficulty;
  gender: Gender;
  isSoldOut: Scalars['Boolean']['input'];
  teamSize: Scalars['Int']['input'];
};

export type AddDirectoryCompInput = {
  categories?: InputMaybe<Array<AddDirectoryCompCategoryInput>>;
  country?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Currency>;
  date?: InputMaybe<Scalars['DateTime']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['DateTime']['input']>;
  eventType?: InputMaybe<Scalars['String']['input']>;
  format?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  organiserEmail: Scalars['String']['input'];
  price?: InputMaybe<Scalars['String']['input']>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  title: Scalars['String']['input'];
  websiteUrl?: InputMaybe<Scalars['String']['input']>;
};

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  postcode?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  street?: Maybe<Scalars['String']['output']>;
  venue?: Maybe<Scalars['String']['output']>;
};

export enum AgeGroup {
  Adults = 'ADULTS',
  Masters = 'MASTERS',
  Open = 'OPEN',
  Teens = 'TEENS'
}

export type AthleteCompetition = {
  __typename?: 'AthleteCompetition';
  competition?: Maybe<Competition>;
  competitionId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type BulkRegistrationInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  teamGroupId?: InputMaybe<Scalars['ID']['input']>;
  teamName?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId: Scalars['String']['input'];
};

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['DateTime']['output'];
  difficulty: Difficulty;
  directoryComp?: Maybe<DirectoryComp>;
  directoryCompId: Scalars['String']['output'];
  gender: Gender;
  id: Scalars['String']['output'];
  isSoldOut: Scalars['Boolean']['output'];
  price: Scalars['Int']['output'];
  tags?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  teamSize: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CategoryInput = {
  difficulty: Difficulty;
  gender: Gender;
  id: Scalars['String']['input'];
  isSoldOut: Scalars['Boolean']['input'];
  tags: Array<Scalars['String']['input']>;
  teamSize: Scalars['Int']['input'];
};

export type Competition = {
  __typename?: 'Competition';
  access?: Maybe<Access>;
  address: Address;
  addressId: Scalars['String']['output'];
  ageGroup?: Maybe<AgeGroup>;
  athletes?: Maybe<Array<Maybe<AthleteCompetition>>>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  createdBy?: Maybe<User>;
  createdByUserId: Scalars['String']['output'];
  creators?: Maybe<Array<Maybe<CompetitionCreator>>>;
  currency?: Maybe<Currency>;
  deadline?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Difficulty>;
  directoryComp?: Maybe<DirectoryComp>;
  directoryCompId?: Maybe<Scalars['String']['output']>;
  earlyBird?: Maybe<EarlyBird>;
  email?: Maybe<Scalars['String']['output']>;
  endDateTime?: Maybe<Scalars['DateTime']['output']>;
  gender?: Maybe<Gender>;
  hasWorkouts: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  instagramHandle?: Maybe<Scalars['String']['output']>;
  isActive: Scalars['Boolean']['output'];
  lastTicketType?: Maybe<TicketType>;
  location?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  org?: Maybe<Org>;
  orgName?: Maybe<Scalars['String']['output']>;
  participantsCount: Scalars['Int']['output'];
  price?: Maybe<Scalars['Float']['output']>;
  registrationEnabled: Scalars['Boolean']['output'];
  registrationTrend?: Maybe<Array<Maybe<DailyRegistration>>>;
  registrationsCount: Scalars['Int']['output'];
  releaseDateTime?: Maybe<Scalars['DateTime']['output']>;
  source?: Maybe<Scalars['String']['output']>;
  startDateTime?: Maybe<Scalars['DateTime']['output']>;
  teamsCount: Scalars['Int']['output'];
  ticketTypes?: Maybe<Array<Maybe<TicketType>>>;
  timezone?: Maybe<Scalars['String']['output']>;
  types?: Maybe<Array<Maybe<CompetitionType>>>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type CompetitionCreator = {
  __typename?: 'CompetitionCreator';
  competition?: Maybe<Competition>;
  competitionId: Scalars['String']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type CompetitionEditSuggestion = {
  __typename?: 'CompetitionEditSuggestion';
  competition?: Maybe<Competition>;
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  reviewer?: Maybe<User>;
  status: CompetitionEditSuggestionStatus;
  suggestedChanges: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export enum CompetitionEditSuggestionStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type CompetitionFilters = {
  __typename?: 'CompetitionFilters';
  cities: Array<Scalars['String']['output']>;
  countries: Array<Scalars['String']['output']>;
  teamSizes: Array<Scalars['Int']['output']>;
};

export type CompetitionInvitationDetails = {
  __typename?: 'CompetitionInvitationDetails';
  competition: Competition;
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  sender?: Maybe<User>;
  status: Scalars['String']['output'];
};

export type CompetitionPayload = {
  __typename?: 'CompetitionPayload';
  competition?: Maybe<Competition>;
  message?: Maybe<Scalars['String']['output']>;
};

export enum CompetitionType {
  Charity = 'CHARITY',
  CrossfitLicencedEvent = 'CROSSFIT_LICENCED_EVENT',
  CrossfitSemiFinals = 'CROSSFIT_SEMI_FINALS',
  Elite = 'ELITE',
  Intermediate = 'INTERMEDIATE',
  InHouse = 'IN_HOUSE',
  Masters = 'MASTERS',
  OlympicWeightlifting = 'OLYMPIC_WEIGHTLIFTING',
  Powerlifting = 'POWERLIFTING',
  PrizeAwarded = 'PRIZE_AWARDED',
  Qualifier = 'QUALIFIER',
  Strongman = 'STRONGMAN',
  Teen = 'TEEN',
  Virtual = 'VIRTUAL',
  WomensOnly = 'WOMENS_ONLY'
}

export type CompetitionWithStats = {
  __typename?: 'CompetitionWithStats';
  competition?: Maybe<Competition>;
  registrationsInPeriod?: Maybe<Scalars['Int']['output']>;
};

export type CreateBreakInput = {
  competitionId: Scalars['String']['input'];
  duration: Scalars['Int']['input'];
  startTime: Scalars['DateTime']['input'];
};

export type CreateEarlyBirdInput = {
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
};

export type CreateHeatInput = {
  startTime: Scalars['DateTime']['input'];
  workoutId: Scalars['String']['input'];
};

export type CreateNotificationSubscriptionInput = {
  countries?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  eventType?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  locations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  teamSize?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePartnerInterestInput = {
  categoryIds?: InputMaybe<Array<Scalars['String']['input']>>;
  description?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  interestType: PartnerInterestType;
  partnerPreference: PartnerPreference;
  phone?: InputMaybe<Scalars['String']['input']>;
  ticketTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  userIds: Array<Scalars['String']['input']>;
};

export type CreatePartnerRequestInput = {
  fromInterestId?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  toInterestId: Scalars['String']['input'];
};

export type CreatePaymentLinkInput = {
  answers: Array<RegistrationAnswerInput>;
  email: Scalars['String']['input'];
  invitationToken?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  redirectTo?: InputMaybe<Scalars['String']['input']>;
  selectedHeatId?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId: Scalars['String']['input'];
};

export type CreateRegistrationInput = {
  answers: Array<RegistrationAnswerInput>;
  email: Scalars['String']['input'];
  invitationToken?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  selectedHeatId?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId: Scalars['String']['input'];
};

export type CreateWorkoutInput = {
  competitionId: Scalars['String']['input'];
  description: Scalars['String']['input'];
  includeStandardsVideo?: InputMaybe<Scalars['Boolean']['input']>;
  location: Scalars['String']['input'];
  name: Scalars['String']['input'];
  releaseDateTime: Scalars['DateTime']['input'];
  scoreType: ScoreType;
  timeCap?: InputMaybe<Scalars['Int']['input']>;
  unitOfMeasurement: Unit;
  videos?: InputMaybe<Array<InputMaybe<WorkoutVideoInput>>>;
};

export enum Currency {
  Aed = 'AED',
  Aud = 'AUD',
  Brl = 'BRL',
  Cad = 'CAD',
  Chf = 'CHF',
  Cny = 'CNY',
  Dkk = 'DKK',
  Eur = 'EUR',
  Gbp = 'GBP',
  Hkd = 'HKD',
  Inr = 'INR',
  Jpy = 'JPY',
  Mxn = 'MXN',
  Nok = 'NOK',
  Nzd = 'NZD',
  Sek = 'SEK',
  Sgd = 'SGD',
  Sr = 'SR',
  Thb = 'THB',
  Usd = 'USD',
  Zar = 'ZAR'
}

export type DailyRegistration = {
  __typename?: 'DailyRegistration';
  count: Scalars['Int']['output'];
  cumulativeCount: Scalars['Int']['output'];
  date: Scalars['String']['output'];
};

export enum Difficulty {
  Elite = 'ELITE',
  Everyday = 'EVERYDAY',
  Intermediate = 'INTERMEDIATE',
  Masters = 'MASTERS',
  Rx = 'RX',
  Teen = 'TEEN'
}

export type DirectoryComp = {
  __typename?: 'DirectoryComp';
  categories?: Maybe<Array<Category>>;
  competition?: Maybe<Competition>;
  competitionId?: Maybe<Scalars['String']['output']>;
  country: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  ctaLink?: Maybe<Scalars['String']['output']>;
  currency?: Maybe<Currency>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  instagramHandle?: Maybe<Scalars['String']['output']>;
  location: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  price?: Maybe<Scalars['Float']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  startDate: Scalars['DateTime']['output'];
  state: Scalars['String']['output'];
  teamSize?: Maybe<Scalars['String']['output']>;
  ticketWebsite?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export enum DirectoryCompType {
  Crossfit = 'CROSSFIT',
  Hyrox = 'HYROX',
  HyroxSimulation = 'HYROX_SIMULATION',
  Other = 'OTHER'
}

export enum DivisionScoreType {
  CumulativeUnits = 'CUMULATIVE_UNITS',
  PointsPerPlace = 'POINTS_PER_PLACE',
  PointBased = 'POINT_BASED'
}

export type EarlyBird = {
  __typename?: 'EarlyBird';
  createdAt: Scalars['DateTime']['output'];
  endDateTime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  limit?: Maybe<Scalars['Int']['output']>;
  price: Scalars['Float']['output'];
  startDateTime?: Maybe<Scalars['DateTime']['output']>;
  ticketTypeId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type EarlyBirdInput = {
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  ticketTypeId: Scalars['String']['input'];
};

export type Entry = {
  __typename?: 'Entry';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  invitationToken?: Maybe<Scalars['String']['output']>;
  laneByWorkoutId?: Maybe<Lane>;
  name: Scalars['String']['output'];
  score?: Maybe<Score>;
  scores: Array<Score>;
  team?: Maybe<Team>;
  teamId?: Maybe<Scalars['String']['output']>;
  ticketType: TicketType;
  ticketTypeId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};


export type EntryLaneByWorkoutIdArgs = {
  workoutId: Scalars['String']['input'];
};


export type EntryScoreArgs = {
  workoutId: Scalars['String']['input'];
};

export type Feedback = {
  __typename?: 'Feedback';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type ForgotPasswordResponse = {
  __typename?: 'ForgotPasswordResponse';
  error?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export enum Gender {
  Female = 'FEMALE',
  Male = 'MALE',
  Mixed = 'MIXED'
}

export type GenerateHeatsInput = {
  firstHeatStartTime?: InputMaybe<Scalars['DateTime']['input']>;
  heatLimitType?: InputMaybe<HeatLimitType>;
  heatsEveryXMinutes?: InputMaybe<Scalars['Int']['input']>;
  lanes?: InputMaybe<Scalars['Int']['input']>;
  maxLimitPerHeat?: InputMaybe<Scalars['Int']['input']>;
  oneTicketPerHeat?: InputMaybe<Scalars['Boolean']['input']>;
  ticketTypeOrderIds?: InputMaybe<Array<Scalars['String']['input']>>;
  totalHeatsPerWorkout?: InputMaybe<Scalars['Int']['input']>;
};

export type Heat = {
  __typename?: 'Heat';
  allTicketTypes: Array<TicketType>;
  availableLanes: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  heatLimitType: HeatLimitType;
  id: Scalars['String']['output'];
  lanes: Array<Lane>;
  maxLimitPerHeat: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  registrationsCount: Scalars['Int']['output'];
  startTime: Scalars['DateTime']['output'];
  ticketTypes: Array<TicketType>;
  updatedAt: Scalars['DateTime']['output'];
  workout?: Maybe<Workout>;
  workoutId: Scalars['String']['output'];
};

export enum HeatLimitType {
  Athletes = 'ATHLETES',
  Entries = 'ENTRIES'
}

export type HeatTicketTypes = {
  __typename?: 'HeatTicketTypes';
  /** The ID of the Heat */
  heatId: Scalars['String']['output'];
  /** The ID of the TicketType */
  ticketTypeId: Scalars['String']['output'];
};

export type Integration = {
  __typename?: 'Integration';
  accessToken: Scalars['String']['output'];
  athleteFirstname?: Maybe<Scalars['String']['output']>;
  athleteId: Scalars['String']['output'];
  athleteLastname?: Maybe<Scalars['String']['output']>;
  athleteProfile?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  expiresAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  refreshToken: Scalars['String']['output'];
  registrationAnswerId: Scalars['String']['output'];
  type: IntegrationType;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type IntegrationInput = {
  accessToken: Scalars['String']['input'];
  athleteFirstname?: InputMaybe<Scalars['String']['input']>;
  athleteId: Scalars['String']['input'];
  athleteLastname?: InputMaybe<Scalars['String']['input']>;
  athleteProfile?: InputMaybe<Scalars['String']['input']>;
  expiresAt: Scalars['String']['input'];
  refreshToken: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export enum IntegrationType {
  Strava = 'STRAVA'
}

export type Invitation = {
  __typename?: 'Invitation';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  sentBy?: Maybe<User>;
  sentByUserId: Scalars['String']['output'];
  status: InvitationStatus;
  team?: Maybe<Team>;
  teamId: Scalars['String']['output'];
  token: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum InvitationStatus {
  Accepted = 'ACCEPTED',
  Expired = 'EXPIRED',
  Pending = 'PENDING',
  Revoked = 'REVOKED'
}

export type Lane = {
  __typename?: 'Lane';
  createdAt: Scalars['DateTime']['output'];
  entry: Entry;
  entryId: Scalars['String']['output'];
  heat: Heat;
  heatId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  number: Scalars['Int']['output'];
  score?: Maybe<Score>;
  updatedAt: Scalars['DateTime']['output'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  error?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export type LogoutPayload = {
  __typename?: 'LogoutPayload';
  message?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  acceptCompetitionInvitation?: Maybe<Scalars['Boolean']['output']>;
  addDirectoryComp?: Maybe<Scalars['Boolean']['output']>;
  adminResetPassword?: Maybe<ResetPasswordResult>;
  approvePotentialCompetitions?: Maybe<Scalars['String']['output']>;
  assignEntryToHeat?: Maybe<Lane>;
  checkInAthlete?: Maybe<Registration>;
  cloneCompetition?: Maybe<Competition>;
  createBreak: Scalars['Boolean']['output'];
  createBulkRegistrations: Array<Maybe<User>>;
  createComp?: Maybe<CompetitionPayload>;
  createHeats: Array<Heat>;
  createNotificationSubscription?: Maybe<NotificationSubscription>;
  createPartnerInterest?: Maybe<Array<Maybe<PartnerInterest>>>;
  createPartnerInterestTeamMembers?: Maybe<Array<Maybe<PartnerInterestTeamMember>>>;
  createPartnerRequest?: Maybe<PartnerRequest>;
  createPaymentLink?: Maybe<Scalars['String']['output']>;
  createReferral?: Maybe<Referral>;
  createRegistration?: Maybe<User>;
  createRegistrationField?: Maybe<RegistrationField>;
  createScore: Score;
  createTicketType?: Maybe<TicketType>;
  createVolunteerTicketType?: Maybe<TicketType>;
  createWorkout?: Maybe<Workout>;
  createWorkoutVideo?: Maybe<WorkoutVideo>;
  deleteCompetition?: Maybe<Scalars['Boolean']['output']>;
  /** Deletes a DirectoryComp and its associated categories. SUPER USER ONLY. */
  deleteDirectoryComp?: Maybe<Scalars['Boolean']['output']>;
  deleteHeat?: Maybe<Heat>;
  deleteRegistration?: Maybe<Scalars['Boolean']['output']>;
  deleteRegistrationField?: Maybe<Scalars['String']['output']>;
  deleteTeam?: Maybe<Scalars['Boolean']['output']>;
  deleteTicketType?: Maybe<TicketType>;
  deleteVolunteerTicket?: Maybe<Scalars['String']['output']>;
  deleteWorkout?: Maybe<Workout>;
  deleteWorkoutVideo?: Maybe<Scalars['Boolean']['output']>;
  duplicateTicketType?: Maybe<TicketType>;
  forgotPassword?: Maybe<ForgotPasswordResponse>;
  generateHeatsFromSettings?: Maybe<Array<Heat>>;
  importDirectoryComp: Scalars['Boolean']['output'];
  inviteToCompetition?: Maybe<Scalars['Boolean']['output']>;
  /** Links a DirectoryComp to a Competition. SUPER USER ONLY. */
  linkDirectoryCompToCompetition?: Maybe<Scalars['Boolean']['output']>;
  login?: Maybe<LoginResponse>;
  logout?: Maybe<LogoutPayload>;
  moveAthleteToTeam?: Maybe<Scalars['Boolean']['output']>;
  rejectPotentialCompetitions?: Maybe<Scalars['String']['output']>;
  requestDirectoryCompEdit?: Maybe<Scalars['Boolean']['output']>;
  resendInvitation?: Maybe<Scalars['Boolean']['output']>;
  resetPassword?: Maybe<ResetPasswordResponse>;
  scheduleDayBeforeEventEmail: Scalars['Boolean']['output'];
  sendBulkEmail: Scalars['Boolean']['output'];
  sendEmails?: Maybe<Scalars['Boolean']['output']>;
  sendInvitations?: Maybe<Scalars['Boolean']['output']>;
  sendLoginToken: Scalars['Boolean']['output'];
  signUp?: Maybe<SignupResponse>;
  submitFeedback?: Maybe<Feedback>;
  suggestCompetitionEdit?: Maybe<Scalars['String']['output']>;
  suggestNewCompetition?: Maybe<Scalars['String']['output']>;
  unassignAllEntries: Scalars['Boolean']['output'];
  unassignEntry?: Maybe<Lane>;
  /** Unlinks a DirectoryComp from a Competition. SUPER USER ONLY. */
  unlinkDirectoryCompFromCompetition?: Maybe<Scalars['Boolean']['output']>;
  updateCompetition?: Maybe<Competition>;
  updateDirectoryComp?: Maybe<DirectoryComp>;
  updateDirectoryCompStates: Array<Maybe<DirectoryComp>>;
  updateEarlyBird?: Maybe<EarlyBird>;
  updateHeat?: Maybe<Heat>;
  updateHeatLimits: Array<Heat>;
  updateInvitation?: Maybe<Invitation>;
  updateLaneHeat?: Maybe<Lane>;
  updateLaneOrder?: Maybe<Lane>;
  updateNotificationSubscription?: Maybe<NotificationSubscription>;
  updatePartnerInterest?: Maybe<PartnerInterest>;
  updatePartnerRequest?: Maybe<PartnerRequest>;
  updatePotentialCompetition?: Maybe<Scalars['String']['output']>;
  updateRegistrationField?: Maybe<RegistrationField>;
  updateScoreById: Score;
  updateTeam?: Maybe<Team>;
  updateTicketType?: Maybe<TicketType>;
  updateUser?: Maybe<User>;
  updateUserBio?: Maybe<User>;
  updateUserById?: Maybe<User>;
  updateWorkout?: Maybe<Workout>;
  updateWorkoutVideo?: Maybe<WorkoutVideo>;
  updateWorkoutVisibility?: Maybe<Workout>;
  uploadCompetitionLogo?: Maybe<Competition>;
  uploadOrgImage?: Maybe<Org>;
  uploadUserAvatar?: Maybe<User>;
};


export type MutationAcceptCompetitionInvitationArgs = {
  token: Scalars['String']['input'];
};


export type MutationAddDirectoryCompArgs = {
  input: AddDirectoryCompInput;
};


export type MutationAdminResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationApprovePotentialCompetitionsArgs = {
  potentialCompetitionIds: Array<Scalars['String']['input']>;
};


export type MutationAssignEntryToHeatArgs = {
  entryId: Scalars['String']['input'];
  heatId: Scalars['String']['input'];
};


export type MutationCheckInAthleteArgs = {
  isCheckedIn: Scalars['Boolean']['input'];
  registrationId: Scalars['String']['input'];
};


export type MutationCloneCompetitionArgs = {
  id: Scalars['String']['input'];
};


export type MutationCreateBreakArgs = {
  input: CreateBreakInput;
};


export type MutationCreateBulkRegistrationsArgs = {
  input: Array<BulkRegistrationInput>;
};


export type MutationCreateCompArgs = {
  endDateTime: Scalars['DateTime']['input'];
  name: Scalars['String']['input'];
  numberOfWorkouts: Scalars['Int']['input'];
  orgName?: InputMaybe<Scalars['String']['input']>;
  startDateTime: Scalars['DateTime']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateHeatsArgs = {
  competitionId: Scalars['String']['input'];
  input: Array<CreateHeatInput>;
};


export type MutationCreateNotificationSubscriptionArgs = {
  input: CreateNotificationSubscriptionInput;
};


export type MutationCreatePartnerInterestArgs = {
  input: CreatePartnerInterestInput;
};


export type MutationCreatePartnerInterestTeamMembersArgs = {
  partnerInterestId: Scalars['String']['input'];
  teamMembers: Array<Scalars['Json']['input']>;
};


export type MutationCreatePartnerRequestArgs = {
  input: CreatePartnerRequestInput;
};


export type MutationCreatePaymentLinkArgs = {
  input: CreatePaymentLinkInput;
};


export type MutationCreateReferralArgs = {
  referredId: Scalars['String']['input'];
  referrerId: Scalars['String']['input'];
};


export type MutationCreateRegistrationArgs = {
  input: CreateRegistrationInput;
};


export type MutationCreateRegistrationFieldArgs = {
  registrationField: RegistrationFieldInput;
  ticketTypeIds: Array<Scalars['String']['input']>;
};


export type MutationCreateScoreArgs = {
  isCompleted: Scalars['Boolean']['input'];
  laneId: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  scorecard?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};


export type MutationCreateTicketTypeArgs = {
  input: TicketTypeInput;
};


export type MutationCreateVolunteerTicketTypeArgs = {
  competitionId: Scalars['String']['input'];
};


export type MutationCreateWorkoutArgs = {
  input: CreateWorkoutInput;
};


export type MutationCreateWorkoutVideoArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  orderIndex?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
  workoutId: Scalars['String']['input'];
};


export type MutationDeleteCompetitionArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteDirectoryCompArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteHeatArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteRegistrationArgs = {
  competitionId: Scalars['ID']['input'];
  registrationId: Scalars['ID']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type MutationDeleteRegistrationFieldArgs = {
  registrationFieldId: Scalars['String']['input'];
};


export type MutationDeleteTeamArgs = {
  competitionId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};


export type MutationDeleteTicketTypeArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteVolunteerTicketArgs = {
  competitionId: Scalars['String']['input'];
};


export type MutationDeleteWorkoutArgs = {
  id: Scalars['String']['input'];
};


export type MutationDeleteWorkoutVideoArgs = {
  id: Scalars['String']['input'];
};


export type MutationDuplicateTicketTypeArgs = {
  originalId: Scalars['String']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationGenerateHeatsFromSettingsArgs = {
  competitionId: Scalars['String']['input'];
  input: GenerateHeatsInput;
};


export type MutationInviteToCompetitionArgs = {
  competitionId: Scalars['String']['input'];
  email: Scalars['String']['input'];
};


export type MutationLinkDirectoryCompToCompetitionArgs = {
  competitionId: Scalars['String']['input'];
  directoryCompId: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMoveAthleteToTeamArgs = {
  competitionId: Scalars['String']['input'];
  targetTeamId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationRejectPotentialCompetitionsArgs = {
  potentialCompetitionIds: Array<Scalars['String']['input']>;
};


export type MutationRequestDirectoryCompEditArgs = {
  input: RequestDirectoryCompEditInput;
};


export type MutationResendInvitationArgs = {
  invitationId: Scalars['String']['input'];
};


export type MutationResetPasswordArgs = {
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationScheduleDayBeforeEventEmailArgs = {
  competitionId: Scalars['ID']['input'];
};


export type MutationSendEmailsArgs = {
  competitionId: Scalars['String']['input'];
  message: Scalars['String']['input'];
  recipients: Array<Scalars['String']['input']>;
  subject: Scalars['String']['input'];
};


export type MutationSendInvitationsArgs = {
  competitionId: Scalars['String']['input'];
  emails: Array<Scalars['String']['input']>;
};


export type MutationSendLoginTokenArgs = {
  input: SendLoginTokenInput;
};


export type MutationSignUpArgs = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSubmitFeedbackArgs = {
  text: Scalars['String']['input'];
};


export type MutationSuggestCompetitionEditArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  competitionId: Scalars['String']['input'];
  country?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSuggestNewCompetitionArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  price?: InputMaybe<Scalars['Float']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUnassignAllEntriesArgs = {
  competitionId: Scalars['String']['input'];
};


export type MutationUnassignEntryArgs = {
  laneId: Scalars['String']['input'];
};


export type MutationUnlinkDirectoryCompFromCompetitionArgs = {
  competitionId: Scalars['String']['input'];
  directoryCompId: Scalars['String']['input'];
};


export type MutationUpdateCompetitionArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  facebook?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  instagram?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  orgName?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  registrationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  types?: InputMaybe<Array<InputMaybe<CompetitionType>>>;
  venue?: InputMaybe<Scalars['String']['input']>;
  youtube?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateDirectoryCompArgs = {
  input: UpdateDirectoryCompInput;
};


export type MutationUpdateEarlyBirdArgs = {
  earlyBird: EarlyBirdInput;
};


export type MutationUpdateHeatArgs = {
  id: Scalars['String']['input'];
  maxLimitPerHeat?: InputMaybe<Scalars['Int']['input']>;
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
  ticketTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type MutationUpdateHeatLimitsArgs = {
  input: Array<UpdateHeatLimitsInput>;
};


export type MutationUpdateInvitationArgs = {
  email: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationUpdateLaneHeatArgs = {
  heatId: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


export type MutationUpdateLaneOrderArgs = {
  laneId: Scalars['String']['input'];
  newPosition: Scalars['Int']['input'];
};


export type MutationUpdateNotificationSubscriptionArgs = {
  input: UpdateNotificationSubscriptionInput;
};


export type MutationUpdatePartnerInterestArgs = {
  categoryId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  instagram?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdatePartnerRequestArgs = {
  input: UpdatePartnerRequestInput;
};


export type MutationUpdatePotentialCompetitionArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  instagramHandle?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateRegistrationFieldArgs = {
  id: Scalars['String']['input'];
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  question?: InputMaybe<Scalars['String']['input']>;
  repeatPerAthlete?: InputMaybe<Scalars['Boolean']['input']>;
  requiredStatus?: InputMaybe<RequiredStatus>;
  ticketTypeIds?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<QuestionType>;
};


export type MutationUpdateScoreByIdArgs = {
  id: Scalars['String']['input'];
  isCompleted: Scalars['Boolean']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  scorecard?: InputMaybe<Scalars['String']['input']>;
  value: Scalars['String']['input'];
};


export type MutationUpdateTeamArgs = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateTicketTypeArgs = {
  input: UpdateTicketTypeInput;
};


export type MutationUpdateUserArgs = {
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateUserBioArgs = {
  bio: Scalars['String']['input'];
};


export type MutationUpdateUserByIdArgs = {
  competitionId: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  userId: Scalars['String']['input'];
};


export type MutationUpdateWorkoutArgs = {
  id: Scalars['String']['input'];
  input: UpdateWorkoutInput;
};


export type MutationUpdateWorkoutVideoArgs = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  orderIndex?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateWorkoutVisibilityArgs = {
  id: Scalars['String']['input'];
  isVisible: Scalars['Boolean']['input'];
};


export type MutationUploadCompetitionLogoArgs = {
  competitionId: Scalars['String']['input'];
  image: Scalars['String']['input'];
};


export type MutationUploadOrgImageArgs = {
  image: Scalars['String']['input'];
  orgId: Scalars['String']['input'];
};


export type MutationUploadUserAvatarArgs = {
  image: Scalars['String']['input'];
};

export type NotificationSubscription = {
  __typename?: 'NotificationSubscription';
  countries?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  difficulty?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  eventType?: Maybe<Scalars['String']['output']>;
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  locations?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  tags?: Maybe<Array<Scalars['String']['output']>>;
  teamSize?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type Org = {
  __typename?: 'Org';
  contactNumber?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  facebook?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  instagram?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  twitter?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  website?: Maybe<Scalars['String']['output']>;
  youtube?: Maybe<Scalars['String']['output']>;
};

export type PartnerInterest = {
  __typename?: 'PartnerInterest';
  category?: Maybe<Category>;
  categoryId?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instagram?: Maybe<Scalars['String']['output']>;
  interestType: PartnerInterestType;
  partnerPreference: PartnerPreference;
  partnerRequests?: Maybe<Array<Maybe<PartnerRequest>>>;
  phone?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  teamMembers?: Maybe<Array<Maybe<PartnerInterestTeamMember>>>;
  ticketType?: Maybe<TicketType>;
  ticketTypeId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export enum PartnerInterestStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Filled = 'FILLED',
  PartiallyFilled = 'PARTIALLY_FILLED'
}

export type PartnerInterestTeamMember = {
  __typename?: 'PartnerInterestTeamMember';
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  invitationToken?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  partnerInterest?: Maybe<PartnerInterest>;
  partnerInterestId: Scalars['String']['output'];
  status: PartnerInterestTeamMemberStatus;
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export enum PartnerInterestTeamMemberStatus {
  Accepted = 'ACCEPTED',
  Invited = 'INVITED',
  Rejected = 'REJECTED'
}

export enum PartnerInterestType {
  LookingForJoiners = 'LOOKING_FOR_JOINERS',
  LookingToJoin = 'LOOKING_TO_JOIN'
}

export enum PartnerPreference {
  Anyone = 'ANYONE',
  SameGym = 'SAME_GYM'
}

export type PartnerRequest = {
  __typename?: 'PartnerRequest';
  createdAt: Scalars['DateTime']['output'];
  fromInterest?: Maybe<PartnerInterest>;
  fromInterestId?: Maybe<Scalars['String']['output']>;
  fromUser?: Maybe<User>;
  fromUserId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  instagram?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  status: PartnerRequestStatus;
  toInterest?: Maybe<PartnerInterest>;
  toInterestId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum PartnerRequestStatus {
  Accepted = 'ACCEPTED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type Payment = {
  __typename?: 'Payment';
  amount: Scalars['Int']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Scalars['String']['output'];
  id: Scalars['String']['output'];
  paymentIntentId: Scalars['String']['output'];
  registrationId: Scalars['String']['output'];
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type PaymentCompetitionMapping = {
  __typename?: 'PaymentCompetitionMapping';
  amount?: Maybe<Scalars['String']['output']>;
  competition?: Maybe<Competition>;
  currency?: Maybe<Scalars['String']['output']>;
  date?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  ticketType?: Maybe<TicketType>;
  transactionId?: Maybe<Scalars['String']['output']>;
};

export type PotentialCompetition = {
  __typename?: 'PotentialCompetition';
  address?: Maybe<Address>;
  addressId?: Maybe<Scalars['String']['output']>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  endDateTime?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['String']['output'];
  instagramHandle?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  orgName?: Maybe<Scalars['String']['output']>;
  potentialTicketTypes?: Maybe<Array<Maybe<PotentialTicketType>>>;
  price?: Maybe<Scalars['Float']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  reviewedAt?: Maybe<Scalars['DateTime']['output']>;
  reviewedBy?: Maybe<Scalars['String']['output']>;
  reviewer?: Maybe<User>;
  scrapedData?: Maybe<Scalars['String']['output']>;
  source: Scalars['String']['output'];
  startDateTime?: Maybe<Scalars['DateTime']['output']>;
  state?: Maybe<Scalars['String']['output']>;
  status: PotentialCompetitionStatus;
  timezone?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export enum PotentialCompetitionStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type PotentialTicketType = {
  __typename?: 'PotentialTicketType';
  allowHeatSelection: Scalars['Boolean']['output'];
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  currency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isVolunteer: Scalars['Boolean']['output'];
  maxEntries: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  passOnPlatformFee: Scalars['Boolean']['output'];
  potentialCompetitionId: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  teamSize: Scalars['Int']['output'];
  updatedAt?: Maybe<Scalars['DateTime']['output']>;
};

export type Query = {
  __typename?: 'Query';
  checkReferralCode?: Maybe<Scalars['Boolean']['output']>;
  earlyBirdById?: Maybe<EarlyBird>;
  getAllDirectoryComps: Array<DirectoryComp>;
  getAvailableHeatsByCompetitionId: Array<Heat>;
  getAvailableTeamsForMove: Array<Team>;
  getCompetitionById?: Maybe<Competition>;
  getCompetitionFilters?: Maybe<CompetitionFilters>;
  getCompetitionInvitation?: Maybe<CompetitionInvitationDetails>;
  getCompetitionsByIds: Array<Competition>;
  getCompetitionsByUser: Array<Competition>;
  getDirectoryComp?: Maybe<DirectoryComp>;
  getDirectoryComps: Array<DirectoryComp>;
  getEntriesByCompetitionId: Array<Entry>;
  getEntriesByWorkoutId: Array<Entry>;
  getEntryByUserAndCompetition?: Maybe<Entry>;
  getExploreCompetitions: Array<Competition>;
  getHeatById: Heat;
  getHeatTicketTypesByHeatId: Array<HeatTicketTypes>;
  getHeatsByCompetitionId: Array<Heat>;
  getHeatsByWorkoutId: Array<Heat>;
  getIntegration?: Maybe<Integration>;
  getIntegrationByRegistrationAnswerId?: Maybe<Integration>;
  getInvitationByToken?: Maybe<Invitation>;
  getInvitationsByTeamId: Array<Invitation>;
  getLaneById: Lane;
  getLanesByHeatId: Array<Lane>;
  /** Fetches the competitions for which the currently authenticated user is registered as an athlete. */
  getMyCompetitionsAsAthlete: Array<Competition>;
  /** Fetches the competitions for which the currently authenticated user is registered as a creator. */
  getMyCompetitionsAsCreator: Array<Competition>;
  getNotificationSubscription?: Maybe<NotificationSubscription>;
  getPartnerInterests?: Maybe<Array<Maybe<PartnerInterest>>>;
  getPartnerRequests?: Maybe<Array<Maybe<PartnerRequest>>>;
  getPaymentMappings?: Maybe<Array<Maybe<PaymentCompetitionMapping>>>;
  getPotentialCompetition?: Maybe<PotentialCompetition>;
  getPotentialCompetitions: Array<PotentialCompetition>;
  getRegistrantById: Registration;
  getRegistrationFieldsByCompetitionId: Array<RegistrationField>;
  getRegistrationStats?: Maybe<RegistrationStats>;
  getRegistrationsByCompetitionId: Array<Registration>;
  getScoreSettingByCompetitionId: ScoreSetting;
  getScoreSettingById: ScoreSetting;
  getScoresByWorkoutId: Array<Score>;
  getSentEmails: Array<SentEmail>;
  getTicketTypeById?: Maybe<TicketType>;
  getTicketTypesByCompetitionId: Array<TicketType>;
  getUnassignedEntriesByCompetitionId: Array<Entry>;
  getUser?: Maybe<User>;
  getUserSchedule: Array<UserScheduleItem>;
  getViewer?: Maybe<User>;
  getWorkoutById: Workout;
  getWorkoutsByCompetitionId: Array<Workout>;
  isUserRegisteredForCompetition: Scalars['Boolean']['output'];
};


export type QueryCheckReferralCodeArgs = {
  referralCode: Scalars['String']['input'];
};


export type QueryEarlyBirdByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetAvailableHeatsByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
  ticketTypeId: Scalars['String']['input'];
};


export type QueryGetAvailableTeamsForMoveArgs = {
  competitionId: Scalars['String']['input'];
  excludeTeamId?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId: Scalars['String']['input'];
};


export type QueryGetCompetitionByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetCompetitionInvitationArgs = {
  token: Scalars['String']['input'];
};


export type QueryGetCompetitionsByIdsArgs = {
  ids: Array<Scalars['String']['input']>;
};


export type QueryGetDirectoryCompArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetDirectoryCompsArgs = {
  initialLoad?: Scalars['Boolean']['input'];
};


export type QueryGetEntriesByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetEntriesByWorkoutIdArgs = {
  workoutId: Scalars['String']['input'];
};


export type QueryGetEntryByUserAndCompetitionArgs = {
  competitionId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryGetExploreCompetitionsArgs = {
  cities?: InputMaybe<Array<Scalars['String']['input']>>;
  countries?: InputMaybe<Array<Scalars['String']['input']>>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  genders?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  teamSize?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetHeatByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetHeatTicketTypesByHeatIdArgs = {
  heatId: Scalars['String']['input'];
};


export type QueryGetHeatsByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetHeatsByWorkoutIdArgs = {
  workoutId: Scalars['String']['input'];
};


export type QueryGetIntegrationArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetIntegrationByRegistrationAnswerIdArgs = {
  registrationAnswerId: Scalars['String']['input'];
};


export type QueryGetInvitationByTokenArgs = {
  token: Scalars['String']['input'];
};


export type QueryGetInvitationsByTeamIdArgs = {
  teamId: Scalars['String']['input'];
};


export type QueryGetLaneByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetLanesByHeatIdArgs = {
  heatId: Scalars['String']['input'];
};


export type QueryGetNotificationSubscriptionArgs = {
  email: Scalars['String']['input'];
};


export type QueryGetPartnerInterestsArgs = {
  competitionId?: InputMaybe<Scalars['String']['input']>;
  directoryCompId?: InputMaybe<Scalars['String']['input']>;
  interestType?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPaymentMappingsArgs = {
  days?: InputMaybe<Scalars['String']['input']>;
  emails?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetPotentialCompetitionArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetRegistrantByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetRegistrationFieldsByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
  isVolunteer?: Scalars['Boolean']['input'];
};


export type QueryGetRegistrationStatsArgs = {
  days?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetRegistrationsByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetScoreSettingByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetScoreSettingByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetScoresByWorkoutIdArgs = {
  workoutId: Scalars['String']['input'];
};


export type QueryGetSentEmailsArgs = {
  compId: Scalars['String']['input'];
};


export type QueryGetTicketTypeByIdArgs = {
  ticketId: Scalars['String']['input'];
};


export type QueryGetTicketTypesByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetUnassignedEntriesByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryGetUserScheduleArgs = {
  competitionId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type QueryGetWorkoutByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetWorkoutsByCompetitionIdArgs = {
  competitionId: Scalars['String']['input'];
};


export type QueryIsUserRegisteredForCompetitionArgs = {
  competitionId: Scalars['String']['input'];
};

export enum QuestionType {
  Dropdown = 'DROPDOWN',
  Email = 'EMAIL',
  Integration = 'INTEGRATION',
  MultipleChoice = 'MULTIPLE_CHOICE',
  MultipleChoiceSelectOne = 'MULTIPLE_CHOICE_SELECT_ONE',
  Statement = 'STATEMENT',
  Text = 'TEXT'
}

export type Referral = {
  __typename?: 'Referral';
  createdAt?: Maybe<Scalars['DateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  referredId?: Maybe<Scalars['String']['output']>;
  referrerId?: Maybe<Scalars['String']['output']>;
};

export type Registration = {
  __typename?: 'Registration';
  competition: Competition;
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isCheckedIn: Scalars['Boolean']['output'];
  registrationAnswers: Array<RegistrationAnswer>;
  registrationFields: Array<RegistrationField>;
  team?: Maybe<Team>;
  teamName?: Maybe<Scalars['String']['output']>;
  ticketType: TicketType;
  ticketTypeId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
};

export type RegistrationAnswer = {
  __typename?: 'RegistrationAnswer';
  answer: Scalars['String']['output'];
  competition?: Maybe<Competition>;
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  registrationField?: Maybe<RegistrationField>;
  registrationFieldId: Scalars['String']['output'];
  ticketTypeId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId: Scalars['String']['output'];
};

export type RegistrationAnswerInput = {
  answer: Scalars['String']['input'];
  integration?: InputMaybe<IntegrationInput>;
  registrationFieldId: Scalars['String']['input'];
};

export type RegistrationField = {
  __typename?: 'RegistrationField';
  id: Scalars['String']['output'];
  integration?: Maybe<Scalars['String']['output']>;
  isEditable: Scalars['Boolean']['output'];
  isVolunteer: Scalars['Boolean']['output'];
  onlyTeams: Scalars['Boolean']['output'];
  options?: Maybe<Array<Scalars['String']['output']>>;
  question: Scalars['String']['output'];
  repeatPerAthlete: Scalars['Boolean']['output'];
  requiredStatus: RequiredStatus;
  sortOrder: Scalars['Int']['output'];
  ticketTypes: Array<TicketType>;
  type: QuestionType;
};

export type RegistrationFieldInput = {
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  question: Scalars['String']['input'];
  repeatPerAthlete?: InputMaybe<Scalars['Boolean']['input']>;
  requiredStatus: RequiredStatus;
  type: QuestionType;
};

export type RegistrationStats = {
  __typename?: 'RegistrationStats';
  competitions?: Maybe<Array<Maybe<CompetitionWithStats>>>;
  periodEnd?: Maybe<Scalars['String']['output']>;
  periodStart?: Maybe<Scalars['String']['output']>;
  totalRegistrations?: Maybe<Scalars['Int']['output']>;
};

export type RequestDirectoryCompEditInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  eventId: Scalars['String']['input'];
  eventTitle: Scalars['String']['input'];
  instagramHandle?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  ticketWebsite?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export enum RequiredStatus {
  Off = 'OFF',
  Optional = 'OPTIONAL',
  Required = 'REQUIRED'
}

export type ResetPasswordResponse = {
  __typename?: 'ResetPasswordResponse';
  error?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type ResetPasswordResult = {
  __typename?: 'ResetPasswordResult';
  error?: Maybe<Scalars['String']['output']>;
  success?: Maybe<Scalars['Boolean']['output']>;
};

export type Score = {
  __typename?: 'Score';
  createdAt: Scalars['DateTime']['output'];
  entry: Entry;
  entryId: Scalars['String']['output'];
  id: Scalars['String']['output'];
  isCompleted: Scalars['Boolean']['output'];
  note?: Maybe<Scalars['String']['output']>;
  scorecard?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  value: Scalars['String']['output'];
  workout: Workout;
  workoutId: Scalars['String']['output'];
};

export type ScoreSetting = {
  __typename?: 'ScoreSetting';
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  firstHeatStartTime: Scalars['DateTime']['output'];
  handleTie: Tiebreaker;
  heatLimitType: HeatLimitType;
  heatsEveryXMinutes: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  maxLimitPerHeat: Scalars['Int']['output'];
  oneTicketPerHeat: Scalars['Boolean']['output'];
  penalizeIncomplete: Scalars['Boolean']['output'];
  penalizeScaled: Scalars['Boolean']['output'];
  scoring: DivisionScoreType;
  ticketTypeOrderIds: Array<Scalars['String']['output']>;
  totalHeatsPerWorkout?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export enum ScoreType {
  RepsLessIsBetter = 'REPS_LESS_IS_BETTER',
  RepsMoreIsBetter = 'REPS_MORE_IS_BETTER',
  RepsOrTimeCompletionBased = 'REPS_OR_TIME_COMPLETION_BASED',
  TimeLessIsBetter = 'TIME_LESS_IS_BETTER',
  TimeMoreIsBetter = 'TIME_MORE_IS_BETTER',
  WeightLessIsBetter = 'WEIGHT_LESS_IS_BETTER',
  WeightMoreIsBetter = 'WEIGHT_MORE_IS_BETTER'
}

export type SendLoginTokenInput = {
  email: Scalars['String']['input'];
  redirectPath?: InputMaybe<Scalars['String']['input']>;
};

export type SentEmail = {
  __typename?: 'SentEmail';
  competitionId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  message: Scalars['String']['output'];
  recipients: Array<Scalars['String']['output']>;
  sentAt: Scalars['DateTime']['output'];
  subject: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type SignupResponse = {
  __typename?: 'SignupResponse';
  error?: Maybe<Scalars['String']['output']>;
  user?: Maybe<User>;
};

export enum SuggestedField {
  Address = 'ADDRESS',
  Box = 'BOX',
  DateOfBirth = 'DATE_OF_BIRTH',
  Email = 'EMAIL',
  EmergencyContactName = 'EMERGENCY_CONTACT_NAME',
  EmergencyContactNumber = 'EMERGENCY_CONTACT_NUMBER',
  Gender = 'GENDER',
  Instagram = 'INSTAGRAM',
  Name = 'NAME',
  Phone = 'PHONE',
  TShirtSize = 'T_SHIRT_SIZE'
}

export type Team = {
  __typename?: 'Team';
  category?: Maybe<Category>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  invitations: Array<Invitation>;
  members: Array<TeamMember>;
  name?: Maybe<Scalars['String']['output']>;
  teamCaptain?: Maybe<User>;
  teamCaptainId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type TeamMember = {
  __typename?: 'TeamMember';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  isCaptain: Scalars['Boolean']['output'];
  team: Team;
  teamId: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user?: Maybe<User>;
  userId?: Maybe<Scalars['String']['output']>;
};

export type TeamMemberInputForInterest = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export enum TeamMemberStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum TeamStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED'
}

export type TicketType = {
  __typename?: 'TicketType';
  allowHeatSelection: Scalars['Boolean']['output'];
  competition: Competition;
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  currency: Currency;
  description?: Maybe<Scalars['String']['output']>;
  divisionScoreType?: Maybe<DivisionScoreType>;
  earlyBird?: Maybe<EarlyBird>;
  earlyBirdId?: Maybe<Scalars['String']['output']>;
  hasAvailability: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  isTeamNameRequired: Scalars['Boolean']['output'];
  isVolunteer: Scalars['Boolean']['output'];
  maxEntries: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  offerEarlyBird: Scalars['Boolean']['output'];
  passOnPlatformFee: Scalars['Boolean']['output'];
  price: Scalars['Float']['output'];
  refundPolicy?: Maybe<Scalars['String']['output']>;
  registered: Scalars['Int']['output'];
  registrationFields: Array<RegistrationField>;
  stripePriceId?: Maybe<Scalars['String']['output']>;
  stripeProductId?: Maybe<Scalars['String']['output']>;
  teamSize: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type TicketTypeInput = {
  allowHeatSelection?: InputMaybe<Scalars['Boolean']['input']>;
  competitionId: Scalars['String']['input'];
  currency: Currency;
  description?: InputMaybe<Scalars['String']['input']>;
  earlyBird?: InputMaybe<EarlyBirdInput>;
  id: Scalars['String']['input'];
  isVolunteer?: InputMaybe<Scalars['Boolean']['input']>;
  maxEntries: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  teamSize: Scalars['Int']['input'];
};

export enum Tiebreaker {
  BestOverallFinish = 'BEST_OVERALL_FINISH',
  None = 'NONE',
  SpecificWorkout = 'SPECIFIC_WORKOUT'
}

export enum Tier {
  Free = 'FREE',
  Pro = 'PRO'
}

export enum Unit {
  Calories = 'CALORIES',
  Feet = 'FEET',
  Kilograms = 'KILOGRAMS',
  Kilometers = 'KILOMETERS',
  Meters = 'METERS',
  Miles = 'MILES',
  Minutes = 'MINUTES',
  Other = 'OTHER',
  Placement = 'PLACEMENT',
  Pounds = 'POUNDS',
  Reps = 'REPS',
  Round = 'ROUND',
  Seconds = 'SECONDS'
}

export type UpdateDirectoryCompInput = {
  categories?: InputMaybe<Array<CategoryInput>>;
  country?: InputMaybe<Scalars['String']['input']>;
  ctaLink?: InputMaybe<Scalars['String']['input']>;
  currency?: InputMaybe<Currency>;
  description?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  instagramHandle?: InputMaybe<Scalars['String']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  ticketWebsite?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateHeatLimitsInput = {
  heatId: Scalars['String']['input'];
  maxEntries: Scalars['Int']['input'];
};

export type UpdateNotificationSubscriptionInput = {
  countries?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  eventType?: InputMaybe<Scalars['String']['input']>;
  gender?: InputMaybe<Scalars['String']['input']>;
  locations?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  tags?: InputMaybe<Array<Scalars['String']['input']>>;
  teamSize?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePartnerRequestInput = {
  id: Scalars['String']['input'];
  status: PartnerRequestStatus;
};

export type UpdateTicketTypeInput = {
  allowHeatSelection?: InputMaybe<Scalars['Boolean']['input']>;
  competitionId: Scalars['String']['input'];
  currency?: InputMaybe<Currency>;
  description?: InputMaybe<Scalars['String']['input']>;
  earlyBird?: InputMaybe<EarlyBirdInput>;
  id: Scalars['String']['input'];
  isVolunteer?: InputMaybe<Scalars['Boolean']['input']>;
  maxEntries?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  teamSize?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateWorkoutInput = {
  competitionId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  includeStandardsVideo?: InputMaybe<Scalars['Boolean']['input']>;
  location?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  releaseDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  scoreType?: InputMaybe<ScoreType>;
  tiebreaker?: InputMaybe<Scalars['Boolean']['input']>;
  timeCap?: InputMaybe<Scalars['Int']['input']>;
  unitOfMeasurement?: InputMaybe<Unit>;
  videos?: InputMaybe<Array<InputMaybe<WorkoutVideoInput>>>;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  competitionsAsAthlete: Array<Competition>;
  competitionsAsCreator: Array<Competition>;
  country?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  dateOfBirth?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  feedback: Array<Feedback>;
  firstName: Scalars['String']['output'];
  gender?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  invitationId?: Maybe<Scalars['String']['output']>;
  isSuperUser: Scalars['Boolean']['output'];
  isVerified: Scalars['Boolean']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  orgId?: Maybe<Scalars['String']['output']>;
  payments: Array<Payment>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  picture?: Maybe<Scalars['String']['output']>;
  referralCode?: Maybe<Scalars['String']['output']>;
  referrals: Array<Referral>;
  referredBy?: Maybe<Scalars['String']['output']>;
  region?: Maybe<Scalars['String']['output']>;
  registrations: Array<Registration>;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserScheduleItem = {
  __typename?: 'UserScheduleItem';
  heat: Heat;
  workout: Workout;
};

export type Workout = {
  __typename?: 'Workout';
  competitionId: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  includeStandardsVideo: Scalars['Boolean']['output'];
  isVisible: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  releaseDateTime: Scalars['DateTime']['output'];
  scoreSetting: ScoreSetting;
  scoreType: ScoreType;
  scores?: Maybe<Array<Maybe<Score>>>;
  timeCap: Scalars['Int']['output'];
  unitOfMeasurement: Unit;
  updatedAt: Scalars['DateTime']['output'];
  videos?: Maybe<Array<Maybe<WorkoutVideo>>>;
};

export type WorkoutVideo = {
  __typename?: 'WorkoutVideo';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  orderIndex: Scalars['Int']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  url: Scalars['String']['output'];
  workoutId: Scalars['String']['output'];
};

export type WorkoutVideoInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  orderIndex?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
  url: Scalars['String']['input'];
};

export type AcceptCompetitionInvitationMutationVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type AcceptCompetitionInvitationMutation = { __typename?: 'Mutation', acceptCompetitionInvitation?: boolean | null };

export type AddDirectoryCompMutationVariables = Exact<{
  input: AddDirectoryCompInput;
}>;


export type AddDirectoryCompMutation = { __typename?: 'Mutation', addDirectoryComp?: boolean | null };

export type ApprovePotentialCompetitionsMutationVariables = Exact<{
  potentialCompetitionIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type ApprovePotentialCompetitionsMutation = { __typename?: 'Mutation', approvePotentialCompetitions?: string | null };

export type AssignEntryToHeatMutationVariables = Exact<{
  entryId: Scalars['String']['input'];
  heatId: Scalars['String']['input'];
}>;


export type AssignEntryToHeatMutation = { __typename?: 'Mutation', assignEntryToHeat?: { __typename?: 'Lane', id: string, number: number, heatId: string, entryId: string } | null };

export type CheckInAthleteMutationVariables = Exact<{
  registrationId: Scalars['String']['input'];
  isCheckedIn: Scalars['Boolean']['input'];
}>;


export type CheckInAthleteMutation = { __typename?: 'Mutation', checkInAthlete?: { __typename?: 'Registration', id: string, userId: string, isCheckedIn: boolean, competitionId: string } | null };

export type CheckReferralCodeQueryVariables = Exact<{
  referralCode: Scalars['String']['input'];
}>;


export type CheckReferralCodeQuery = { __typename?: 'Query', checkReferralCode?: boolean | null };

export type CloneCompetitionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type CloneCompetitionMutation = { __typename?: 'Mutation', cloneCompetition?: { __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, endDateTime?: any | null, registrationsCount: number } | null };

export type CreateBreakMutationVariables = Exact<{
  input: CreateBreakInput;
}>;


export type CreateBreakMutation = { __typename?: 'Mutation', createBreak: boolean };

export type CreateBulkRegistrationsMutationVariables = Exact<{
  input: Array<BulkRegistrationInput> | BulkRegistrationInput;
}>;


export type CreateBulkRegistrationsMutation = { __typename?: 'Mutation', createBulkRegistrations: Array<{ __typename?: 'User', id: string, email: string, firstName: string, lastName?: string | null } | null> };

export type CreateCompMutationVariables = Exact<{
  name: Scalars['String']['input'];
  startDateTime: Scalars['DateTime']['input'];
  endDateTime: Scalars['DateTime']['input'];
  numberOfWorkouts: Scalars['Int']['input'];
  timezone?: InputMaybe<Scalars['String']['input']>;
  orgName?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateCompMutation = { __typename?: 'Mutation', createComp?: { __typename?: 'CompetitionPayload', message?: string | null, competition?: { __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, endDateTime?: any | null, timezone?: string | null, orgName?: string | null, description?: string | null, createdAt?: any | null, updatedAt?: any | null } | null } | null };

export type CreateHeatsMutationVariables = Exact<{
  input: Array<CreateHeatInput> | CreateHeatInput;
  competitionId: Scalars['String']['input'];
}>;


export type CreateHeatsMutation = { __typename?: 'Mutation', createHeats: Array<{ __typename?: 'Heat', id: string, startTime: any, workoutId: string, name: string }> };

export type CreateNotificationSubscriptionMutationVariables = Exact<{
  input: CreateNotificationSubscriptionInput;
}>;


export type CreateNotificationSubscriptionMutation = { __typename?: 'Mutation', createNotificationSubscription?: { __typename?: 'NotificationSubscription', id: string, email: string, eventType?: string | null, countries?: Array<string | null> | null, locations?: Array<string | null> | null, tags?: Array<string> | null } | null };

export type CreatePartnerInterestMutationVariables = Exact<{
  input: CreatePartnerInterestInput;
}>;


export type CreatePartnerInterestMutation = { __typename?: 'Mutation', createPartnerInterest?: Array<{ __typename?: 'PartnerInterest', id: string, userId: string, interestType: PartnerInterestType, partnerPreference: PartnerPreference, categoryId?: string | null, ticketTypeId?: string | null, description?: string | null, phone?: string | null, instagram?: string | null, status: string, createdAt: any, updatedAt: any, user?: { __typename?: 'User', id: string, name?: string | null, picture?: string | null } | null, category?: { __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, isSoldOut: boolean, tags?: Array<string | null> | null } | null } | null> | null };

export type CreatePartnerInterestTeamMembersMutationVariables = Exact<{
  partnerInterestId: Scalars['String']['input'];
  teamMembers: Array<Scalars['Json']['input']> | Scalars['Json']['input'];
}>;


export type CreatePartnerInterestTeamMembersMutation = { __typename?: 'Mutation', createPartnerInterestTeamMembers?: Array<{ __typename?: 'PartnerInterestTeamMember', id: string, partnerInterestId: string, name: string, email: string, userId?: string | null, status: PartnerInterestTeamMemberStatus, invitationToken?: string | null, createdAt: any, updatedAt: any, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null } | null> | null };

export type CreatePartnerRequestMutationVariables = Exact<{
  input: CreatePartnerRequestInput;
}>;


export type CreatePartnerRequestMutation = { __typename?: 'Mutation', createPartnerRequest?: { __typename?: 'PartnerRequest', id: string, fromInterestId?: string | null, fromUserId?: string | null, toInterestId: string, message?: string | null, status: PartnerRequestStatus, instagram?: string | null, createdAt: any, updatedAt: any, fromInterest?: { __typename?: 'PartnerInterest', id: string, userId: string, categoryId?: string | null, user?: { __typename?: 'User', id: string, name?: string | null, picture?: string | null } | null } | null, fromUser?: { __typename?: 'User', id: string, name?: string | null, picture?: string | null } | null, toInterest?: { __typename?: 'PartnerInterest', id: string, userId: string, categoryId?: string | null, user?: { __typename?: 'User', id: string, name?: string | null, picture?: string | null } | null } | null } | null };

export type CreatePaymentLinkMutationVariables = Exact<{
  input: CreatePaymentLinkInput;
}>;


export type CreatePaymentLinkMutation = { __typename?: 'Mutation', createPaymentLink?: string | null };

export type CreateRegistrationMutationVariables = Exact<{
  input: CreateRegistrationInput;
}>;


export type CreateRegistrationMutation = { __typename?: 'Mutation', createRegistration?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string } | null };

export type CreateRegistrationFieldMutationVariables = Exact<{
  ticketTypeIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
  registrationField: RegistrationFieldInput;
}>;


export type CreateRegistrationFieldMutation = { __typename?: 'Mutation', createRegistrationField?: { __typename?: 'RegistrationField', id: string, question: string, type: QuestionType, requiredStatus: RequiredStatus, options?: Array<string> | null } | null };

export type CreateScoreMutationVariables = Exact<{
  value: Scalars['String']['input'];
  laneId: Scalars['String']['input'];
  isCompleted: Scalars['Boolean']['input'];
  scorecard?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type CreateScoreMutation = { __typename?: 'Mutation', createScore: { __typename?: 'Score', id: string, value: string, isCompleted: boolean } };

export type CreateTicketTypeMutationVariables = Exact<{
  input: TicketTypeInput;
}>;


export type CreateTicketTypeMutation = { __typename?: 'Mutation', createTicketType?: { __typename?: 'TicketType', id: string, name: string } | null };

export type CreateVolunteerTicketTypeMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type CreateVolunteerTicketTypeMutation = { __typename?: 'Mutation', createVolunteerTicketType?: { __typename?: 'TicketType', id: string, name: string } | null };

export type CreateWorkoutMutationVariables = Exact<{
  input: CreateWorkoutInput;
}>;


export type CreateWorkoutMutation = { __typename?: 'Mutation', createWorkout?: { __typename?: 'Workout', id: string, name: string, description: string, releaseDateTime: any, competitionId: string, location: string, scoreType: ScoreType, unitOfMeasurement: Unit, timeCap: number, includeStandardsVideo: boolean, createdAt: any, updatedAt: any, videos?: Array<{ __typename?: 'WorkoutVideo', id: string, title: string, description?: string | null, url: string, orderIndex: number } | null> | null } | null };

export type CreateWorkoutVideoMutationVariables = Exact<{
  workoutId: Scalars['String']['input'];
  title: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  url: Scalars['String']['input'];
  orderIndex?: InputMaybe<Scalars['Int']['input']>;
}>;


export type CreateWorkoutVideoMutation = { __typename?: 'Mutation', createWorkoutVideo?: { __typename?: 'WorkoutVideo', id: string, title: string, description?: string | null, url: string, orderIndex: number, workoutId: string } | null };

export type DeleteCompetitionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteCompetitionMutation = { __typename?: 'Mutation', deleteCompetition?: boolean | null };

export type DeleteDirectoryCompMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteDirectoryCompMutation = { __typename?: 'Mutation', deleteDirectoryComp?: boolean | null };

export type DeleteHeatMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteHeatMutation = { __typename?: 'Mutation', deleteHeat?: { __typename?: 'Heat', id: string, startTime: any, workoutId: string } | null };

export type DeleteRegistrationMutationVariables = Exact<{
  registrationId: Scalars['ID']['input'];
  userId: Scalars['ID']['input'];
  competitionId: Scalars['ID']['input'];
  teamId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type DeleteRegistrationMutation = { __typename?: 'Mutation', deleteRegistration?: boolean | null };

export type DeleteRegistrationFieldMutationVariables = Exact<{
  registrationFieldId: Scalars['String']['input'];
}>;


export type DeleteRegistrationFieldMutation = { __typename?: 'Mutation', deleteRegistrationField?: string | null };

export type DeleteTeamMutationVariables = Exact<{
  teamId: Scalars['ID']['input'];
  competitionId: Scalars['ID']['input'];
}>;


export type DeleteTeamMutation = { __typename?: 'Mutation', deleteTeam?: boolean | null };

export type DeleteTicketTypeMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteTicketTypeMutation = { __typename?: 'Mutation', deleteTicketType?: { __typename?: 'TicketType', id: string, name: string, competitionId: string } | null };

export type DeleteVolunteerTicketMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type DeleteVolunteerTicketMutation = { __typename?: 'Mutation', deleteVolunteerTicket?: string | null };

export type DeleteWorkoutMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteWorkoutMutation = { __typename?: 'Mutation', deleteWorkout?: { __typename?: 'Workout', id: string, name: string } | null };

export type DuplicateTicketTypeMutationVariables = Exact<{
  originalId: Scalars['String']['input'];
}>;


export type DuplicateTicketTypeMutation = { __typename?: 'Mutation', duplicateTicketType?: { __typename?: 'TicketType', id: string, name: string, description?: string | null, maxEntries: number, price: number, teamSize: number, currency: Currency, isVolunteer: boolean, competitionId: string, allowHeatSelection: boolean, registered: number, createdAt: any, updatedAt: any } | null };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword?: { __typename?: 'ForgotPasswordResponse', success?: boolean | null, error?: string | null } | null };

export type GenerateHeatsFromSettingsMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
  input: GenerateHeatsInput;
}>;


export type GenerateHeatsFromSettingsMutation = { __typename?: 'Mutation', generateHeatsFromSettings?: Array<{ __typename?: 'Heat', id: string }> | null };

export type GetAllDirectoryCompsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllDirectoryCompsQuery = { __typename?: 'Query', getAllDirectoryComps: Array<{ __typename?: 'DirectoryComp', id: string, title: string, teamSize?: string | null, location: string, country: string, startDate: any, endDate?: any | null, price?: number | null, currency?: Currency | null, website?: string | null, ticketWebsite?: string | null, ctaLink?: string | null, email?: string | null, instagramHandle?: string | null, logo?: string | null, description?: string | null, categories?: Array<{ __typename?: 'Category', id: string, gender: Gender, teamSize: number, difficulty: Difficulty, isSoldOut: boolean, tags?: Array<string | null> | null }> | null }> };

export type GetAvailableHeatsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
  ticketTypeId: Scalars['String']['input'];
}>;


export type GetAvailableHeatsByCompetitionIdQuery = { __typename?: 'Query', getAvailableHeatsByCompetitionId: Array<{ __typename?: 'Heat', id: string, startTime: any, workoutId: string, maxLimitPerHeat: number, createdAt: any, updatedAt: any, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name: string }> }> };

export type GetAvailableTeamsForMoveQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
  ticketTypeId: Scalars['String']['input'];
  excludeTeamId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetAvailableTeamsForMoveQuery = { __typename?: 'Query', getAvailableTeamsForMove: Array<{ __typename?: 'Team', id: string, name?: string | null, teamCaptainId?: string | null, members: Array<{ __typename?: 'TeamMember', id: string, user?: { __typename?: 'User', id: string, name?: string | null } | null }> }> };

export type GetCompetitionByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetCompetitionByIdQuery = { __typename?: 'Query', getCompetitionById?: { __typename?: 'Competition', id: string, name?: string | null, description?: string | null, startDateTime?: any | null, endDateTime?: any | null, timezone?: string | null, releaseDateTime?: any | null, hasWorkouts: boolean, directoryCompId?: string | null, logo?: string | null, orgName?: string | null, website?: string | null, source?: string | null, registrationEnabled: boolean, currency?: Currency | null, price?: number | null, createdBy?: { __typename?: 'User', email: string } | null, org?: { __typename?: 'Org', id?: string | null, name?: string | null, email: string, twitter?: string | null, description?: string | null, facebook?: string | null, instagram?: string | null, youtube?: string | null, website?: string | null } | null, address: { __typename?: 'Address', venue?: string | null, street?: string | null, city?: string | null, country?: string | null, postcode?: string | null, region?: string | null } } | null };

export type GetCompetitionFiltersQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCompetitionFiltersQuery = { __typename?: 'Query', getCompetitionFilters?: { __typename?: 'CompetitionFilters', countries: Array<string>, cities: Array<string>, teamSizes: Array<number> } | null };

export type GetCompetitionInvitationQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type GetCompetitionInvitationQuery = { __typename?: 'Query', getCompetitionInvitation?: { __typename?: 'CompetitionInvitationDetails', id: string, email?: string | null, createdAt: any, status: string, competition: { __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, endDateTime?: any | null }, sender?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null } | null } | null };

export type GetCompetitionNameByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetCompetitionNameByIdQuery = { __typename?: 'Query', getCompetitionById?: { __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null } | null };

export type GetCompetitionScheduleQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetCompetitionScheduleQuery = { __typename?: 'Query', getHeatsByCompetitionId: Array<{ __typename?: 'Heat', id: string, name: string, startTime: any, workout?: { __typename?: 'Workout', id: string, name: string } | null, lanes: Array<{ __typename?: 'Lane', entry: { __typename?: 'Entry', name: string, team?: { __typename?: 'Team', name?: string | null, members: Array<{ __typename?: 'TeamMember', user?: { __typename?: 'User', name?: string | null } | null }> } | null } }> }> };

export type GetCompetitionStartDateTimeQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetCompetitionStartDateTimeQuery = { __typename?: 'Query', getCompetitionById?: { __typename?: 'Competition', startDateTime?: any | null } | null };

export type GetCompetitionsByIdsQueryVariables = Exact<{
  ids: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GetCompetitionsByIdsQuery = { __typename?: 'Query', getCompetitionsByIds: Array<{ __typename?: 'Competition', id: string, name?: string | null, registrationsCount: number, participantsCount: number, teamsCount: number, registrationTrend?: Array<{ __typename?: 'DailyRegistration', date: string, count: number, cumulativeCount: number } | null> | null }> };

export type GetDirectoryCompQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetDirectoryCompQuery = { __typename?: 'Query', getDirectoryComp?: { __typename?: 'DirectoryComp', id: string, title: string, location: string, country: string, startDate: any, endDate?: any | null, price?: number | null, currency?: Currency | null, website?: string | null, email?: string | null, logo?: string | null, description?: string | null, instagramHandle?: string | null, createdAt: any, updatedAt: any, competitionId?: string | null, competition?: { __typename?: 'Competition', id: string, startDateTime?: any | null, endDateTime?: any | null } | null, categories?: Array<{ __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, isSoldOut: boolean, tags?: Array<string | null> | null }> | null } | null };

export type GetDirectoryCompsQueryVariables = Exact<{
  initialLoad: Scalars['Boolean']['input'];
}>;


export type GetDirectoryCompsQuery = { __typename?: 'Query', getDirectoryComps: Array<{ __typename?: 'DirectoryComp', id: string, title: string, teamSize?: string | null, location: string, country: string, startDate: any, endDate?: any | null, price?: number | null, currency?: Currency | null, website?: string | null, ticketWebsite?: string | null, ctaLink?: string | null, email?: string | null, instagramHandle?: string | null, logo?: string | null, description?: string | null, region?: string | null, competitionId?: string | null, competition?: { __typename?: 'Competition', id: string, startDateTime?: any | null, endDateTime?: any | null } | null, categories?: Array<{ __typename?: 'Category', id: string, gender: Gender, teamSize: number, difficulty: Difficulty, isSoldOut: boolean, tags?: Array<string | null> | null }> | null }> };

export type GetEarlyBirdByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetEarlyBirdByIdQuery = { __typename?: 'Query', earlyBirdById?: { __typename?: 'EarlyBird', id: string, price: number, limit?: number | null, startDateTime?: any | null, endDateTime?: any | null, ticketTypeId?: string | null } | null };

export type GetEntriesByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetEntriesByCompetitionIdQuery = { __typename?: 'Query', getEntriesByCompetitionId: Array<{ __typename?: 'Entry', id: string, name: string, team?: { __typename?: 'Team', members: Array<{ __typename?: 'TeamMember', user?: { __typename?: 'User', name?: string | null } | null }> } | null, ticketType: { __typename?: 'TicketType', id: string, name: string, isVolunteer: boolean }, scores: Array<{ __typename?: 'Score', id: string, value: string, isCompleted: boolean, workout: { __typename?: 'Workout', id: string, name: string, scoreType: ScoreType } }> }> };

export type GetEntriesByWorkoutIdQueryVariables = Exact<{
  workoutId: Scalars['String']['input'];
}>;


export type GetEntriesByWorkoutIdQuery = { __typename?: 'Query', getEntriesByWorkoutId: Array<{ __typename?: 'Entry', id: string, name: string, team?: { __typename?: 'Team', members: Array<{ __typename?: 'TeamMember', user?: { __typename?: 'User', name?: string | null } | null }> } | null, ticketType: { __typename?: 'TicketType', name: string }, laneByWorkoutId?: { __typename?: 'Lane', id: string, heat: { __typename?: 'Heat', name: string, startTime: any } } | null, score?: { __typename?: 'Score', id: string, value: string, isCompleted: boolean, workout: { __typename?: 'Workout', id: string, name: string } } | null }> };

export type GetEntryByUserAndCompetitionQueryVariables = Exact<{
  userId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type GetEntryByUserAndCompetitionQuery = { __typename?: 'Query', getEntryByUserAndCompetition?: { __typename?: 'Entry', id: string, teamId?: string | null, ticketTypeId: string, userId: string, invitationToken?: string | null, team?: { __typename?: 'Team', id: string, name?: string | null, teamCaptainId?: string | null, invitations: Array<{ __typename?: 'Invitation', email?: string | null, status: InvitationStatus }>, members: Array<{ __typename?: 'TeamMember', id: string, userId?: string | null, isCaptain: boolean, user?: { __typename?: 'User', firstName: string, lastName?: string | null, email: string } | null }> } | null } | null };

export type GetEntryNamesByHeatIdQueryVariables = Exact<{
  heatId: Scalars['String']['input'];
}>;


export type GetEntryNamesByHeatIdQuery = { __typename?: 'Query', getLanesByHeatId: Array<{ __typename?: 'Lane', entry: { __typename?: 'Entry', name: string } }> };

export type GetExploreCompetitionsQueryVariables = Exact<{
  limit: Scalars['Int']['input'];
  offset: Scalars['Int']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
  countries?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  cities?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  genders?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  teamSize?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetExploreCompetitionsQuery = { __typename?: 'Query', getExploreCompetitions: Array<{ __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, endDateTime?: any | null, logo?: string | null, description?: string | null, location?: string | null, timezone?: string | null, currency?: Currency | null, price?: number | null, source?: string | null, address: { __typename?: 'Address', id?: string | null, city?: string | null, country?: string | null, venue?: string | null }, ticketTypes?: Array<{ __typename?: 'TicketType', id: string, name: string, price: number, currency: Currency, isVolunteer: boolean, teamSize: number } | null> | null }> };

export type GetHeatByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetHeatByIdQuery = { __typename?: 'Query', getHeatById: { __typename?: 'Heat', id: string, availableLanes: number, maxLimitPerHeat: number, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name: string }>, allTicketTypes: Array<{ __typename?: 'TicketType', id: string, name: string }>, workout?: { __typename?: 'Workout', unitOfMeasurement: Unit } | null } };

export type GetHeatByIdTicketSelectorQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetHeatByIdTicketSelectorQuery = { __typename?: 'Query', getHeatById: { __typename?: 'Heat', id: string, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name: string }>, allTicketTypes: Array<{ __typename?: 'TicketType', id: string, name: string }> } };

export type GetHeatsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetHeatsByCompetitionIdQuery = { __typename?: 'Query', getHeatsByCompetitionId: Array<{ __typename?: 'Heat', id: string, startTime: any, workoutId: string, name: string, registrationsCount: number, maxLimitPerHeat: number }> };

export type GetHeatsByWorkoutIdQueryVariables = Exact<{
  workoutId: Scalars['String']['input'];
}>;


export type GetHeatsByWorkoutIdQuery = { __typename?: 'Query', getHeatsByWorkoutId: Array<{ __typename?: 'Heat', id: string, startTime: any, workoutId: string, name: string, registrationsCount: number, maxLimitPerHeat: number, heatLimitType: HeatLimitType, lanes: Array<{ __typename?: 'Lane', id: string, number: number }> }> };

export type GetInvitationsByTeamIdQueryVariables = Exact<{
  teamId: Scalars['String']['input'];
}>;


export type GetInvitationsByTeamIdQuery = { __typename?: 'Query', getInvitationsByTeamId: Array<{ __typename?: 'Invitation', id: string, email?: string | null, status: InvitationStatus, createdAt: any, sentBy?: { __typename?: 'User', id: string, name?: string | null } | null }> };

export type GetInvitationByTokenQueryVariables = Exact<{
  token: Scalars['String']['input'];
}>;


export type GetInvitationByTokenQuery = { __typename?: 'Query', getInvitationByToken?: { __typename?: 'Invitation', id: string, teamId: string, token: string, email?: string | null, status: InvitationStatus, team?: { __typename?: 'Team', id: string, name?: string | null, teamCaptain?: { __typename?: 'User', name?: string | null } | null } | null } | null };

export type GetLaneByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetLaneByIdQuery = { __typename?: 'Query', getLaneById: { __typename?: 'Lane', id: string, score?: { __typename?: 'Score', id: string, value: string, scorecard?: string | null, note?: string | null } | null } };

export type GetLanesByHeatIdQueryVariables = Exact<{
  heatId: Scalars['String']['input'];
}>;


export type GetLanesByHeatIdQuery = { __typename?: 'Query', getLanesByHeatId: Array<{ __typename?: 'Lane', id: string, number: number, score?: { __typename?: 'Score', value: string } | null, entry: { __typename?: 'Entry', name: string, team?: { __typename?: 'Team', members: Array<{ __typename?: 'TeamMember', user?: { __typename?: 'User', name?: string | null } | null }> } | null, ticketType: { __typename?: 'TicketType', id: string, name: string } } }> };

export type GetMaxEntriesQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetMaxEntriesQuery = { __typename?: 'Query', getScoreSettingByCompetitionId: { __typename?: 'ScoreSetting', id: string, heatLimitType: HeatLimitType, maxLimitPerHeat: number } };

export type GetMaxLimitPerHeatQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetMaxLimitPerHeatQuery = { __typename?: 'Query', getScoreSettingByCompetitionId: { __typename?: 'ScoreSetting', maxLimitPerHeat: number } };

export type GetMyCompetitionsAsAthleteQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMyCompetitionsAsAthleteQuery = { __typename?: 'Query', getMyCompetitionsAsAthlete: Array<{ __typename?: 'Competition', id: string, name?: string | null }> };

export type GetNotificationSubscriptionQueryVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type GetNotificationSubscriptionQuery = { __typename?: 'Query', getNotificationSubscription?: { __typename?: 'NotificationSubscription', id: string, email: string, eventType?: string | null, countries?: Array<string | null> | null, locations?: Array<string | null> | null, tags?: Array<string> | null, gender?: string | null, difficulty?: string | null, teamSize?: string | null } | null };

export type GetPartnerInterestsQueryVariables = Exact<{
  status?: InputMaybe<Scalars['String']['input']>;
  interestType?: InputMaybe<Scalars['String']['input']>;
  directoryCompId?: InputMaybe<Scalars['String']['input']>;
  competitionId?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPartnerInterestsQuery = { __typename?: 'Query', getPartnerInterests?: Array<{ __typename?: 'PartnerInterest', id: string, userId: string, interestType: PartnerInterestType, partnerPreference: PartnerPreference, categoryId?: string | null, description?: string | null, phone?: string | null, instagram?: string | null, status: string, createdAt: any, updatedAt: any, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null, bio?: string | null } | null, category?: { __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, directoryComp?: { __typename?: 'DirectoryComp', id: string, title: string } | null } | null, ticketType?: { __typename?: 'TicketType', id: string, name: string, teamSize: number, competition: { __typename?: 'Competition', id: string, name?: string | null } } | null, teamMembers?: Array<{ __typename?: 'PartnerInterestTeamMember', id: string, name: string, email: string, userId?: string | null, status: PartnerInterestTeamMemberStatus, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null } | null> | null, partnerRequests?: Array<{ __typename?: 'PartnerRequest', id: string, status: PartnerRequestStatus, fromUser?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null, fromInterest?: { __typename?: 'PartnerInterest', id: string, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null } | null } | null> | null } | null> | null };

export type GetPartnerRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPartnerRequestsQuery = { __typename?: 'Query', getPartnerRequests?: Array<{ __typename?: 'PartnerRequest', id: string, fromInterestId?: string | null, fromUserId?: string | null, toInterestId: string, message?: string | null, phone?: string | null, status: PartnerRequestStatus, createdAt: any, updatedAt: any, fromUser?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null, email: string } | null, fromInterest?: { __typename?: 'PartnerInterest', id: string, userId: string, status: string, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null, email: string } | null, category?: { __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, directoryComp?: { __typename?: 'DirectoryComp', id: string, title: string } | null } | null, ticketType?: { __typename?: 'TicketType', id: string, name: string, teamSize: number, competition: { __typename?: 'Competition', id: string, name?: string | null } } | null, teamMembers?: Array<{ __typename?: 'PartnerInterestTeamMember', id: string, name: string, email: string, userId?: string | null, status: PartnerInterestTeamMemberStatus, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null } | null> | null } | null, toInterest?: { __typename?: 'PartnerInterest', id: string, userId: string, status: string, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null, email: string } | null, category?: { __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, directoryComp?: { __typename?: 'DirectoryComp', id: string, title: string } | null } | null, ticketType?: { __typename?: 'TicketType', id: string, name: string, teamSize: number, competition: { __typename?: 'Competition', id: string, name?: string | null } } | null, teamMembers?: Array<{ __typename?: 'PartnerInterestTeamMember', id: string, name: string, email: string, userId?: string | null, status: PartnerInterestTeamMemberStatus, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null } | null> | null } | null } | null> | null };

export type GetPaymentMappingsQueryVariables = Exact<{
  emails?: InputMaybe<Scalars['String']['input']>;
  days?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetPaymentMappingsQuery = { __typename?: 'Query', getPaymentMappings?: Array<{ __typename?: 'PaymentCompetitionMapping', email?: string | null, transactionId?: string | null, amount?: string | null, currency?: string | null, date?: string | null, competition?: { __typename?: 'Competition', id: string, name?: string | null, orgName?: string | null } | null, ticketType?: { __typename?: 'TicketType', id: string, name: string } | null } | null> | null };

export type GetPotentialCompetitionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetPotentialCompetitionsQuery = { __typename?: 'Query', getPotentialCompetitions: Array<{ __typename?: 'PotentialCompetition', id: string, name: string, description?: string | null, startDateTime?: any | null, endDateTime?: any | null, addressId?: string | null, timezone?: string | null, logo?: string | null, website?: string | null, email?: string | null, instagramHandle?: string | null, currency?: string | null, price?: number | null, source: string, country?: string | null, state?: string | null, region?: string | null, orgName?: string | null, scrapedData?: string | null, status: PotentialCompetitionStatus, reviewedBy?: string | null, reviewedAt?: any | null, createdAt?: any | null, updatedAt?: any | null, address?: { __typename?: 'Address', id?: string | null, venue?: string | null, city?: string | null, country?: string | null } | null, potentialTicketTypes?: Array<{ __typename?: 'PotentialTicketType', id: string, name: string, description?: string | null, price: number, currency?: string | null, maxEntries: number, teamSize: number, isVolunteer: boolean, allowHeatSelection: boolean, passOnPlatformFee: boolean } | null> | null, reviewer?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string } | null }> };

export type GetUserWithReferralsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUserWithReferralsQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string } | null };

export type GetRegistrationAnswersByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetRegistrationAnswersByCompetitionIdQuery = { __typename?: 'Query', getRegistrationsByCompetitionId: Array<{ __typename?: 'Registration', registrationAnswers: Array<{ __typename?: 'RegistrationAnswer', answer: string, registrationField?: { __typename?: 'RegistrationField', question: string } | null }> }> };

export type GetRegistrationByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetRegistrationByIdQuery = { __typename?: 'Query', getRegistrantById: { __typename?: 'Registration', id: string, createdAt: any, teamName?: string | null, user: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, name?: string | null, email: string }, team?: { __typename?: 'Team', id: string, name?: string | null, members: Array<{ __typename?: 'TeamMember', id: string, user?: { __typename?: 'User', id: string, name?: string | null, email: string } | null }> } | null, registrationAnswers: Array<{ __typename?: 'RegistrationAnswer', id: string, answer: string, registrationField?: { __typename?: 'RegistrationField', id: string, type: QuestionType, question: string, options?: Array<string> | null } | null }>, ticketType: { __typename?: 'TicketType', id: string, name: string, teamSize: number } } };

export type GetRegistrationEmailsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetRegistrationEmailsByCompetitionIdQuery = { __typename?: 'Query', getRegistrationsByCompetitionId: Array<{ __typename?: 'Registration', id: string, user: { __typename?: 'User', email: string } }> };

export type GetRegistrationFieldsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
  isVolunteer?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetRegistrationFieldsByCompetitionIdQuery = { __typename?: 'Query', getRegistrationFieldsByCompetitionId: Array<{ __typename?: 'RegistrationField', id: string, question: string, repeatPerAthlete: boolean, isEditable: boolean, type: QuestionType, requiredStatus: RequiredStatus, options?: Array<string> | null, onlyTeams: boolean, ticketTypes: Array<{ __typename?: 'TicketType', id: string, name: string, isVolunteer: boolean }> }> };

export type GetRegistrationStatsQueryVariables = Exact<{
  days?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetRegistrationStatsQuery = { __typename?: 'Query', getRegistrationStats?: { __typename?: 'RegistrationStats', totalRegistrations?: number | null, periodStart?: string | null, periodEnd?: string | null, competitions?: Array<{ __typename?: 'CompetitionWithStats', registrationsInPeriod?: number | null, competition?: { __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, registrationsCount: number, participantsCount: number, orgName?: string | null } | null } | null> | null } | null };

export type GetRegistrationsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetRegistrationsByCompetitionIdQuery = { __typename?: 'Query', getRegistrationsByCompetitionId: Array<{ __typename?: 'Registration', id: string, isCheckedIn: boolean, createdAt: any, teamName?: string | null, user: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, name?: string | null, email: string }, registrationFields: Array<{ __typename?: 'RegistrationField', id: string, question: string, repeatPerAthlete: boolean, isEditable: boolean, requiredStatus: RequiredStatus }>, team?: { __typename?: 'Team', id: string, name?: string | null, members: Array<{ __typename?: 'TeamMember', id: string, user?: { __typename?: 'User', id: string, name?: string | null, email: string } | null }> } | null, ticketType: { __typename?: 'TicketType', id: string, name: string, isVolunteer: boolean, teamSize: number } }> };

export type GetRegistrationsForExportQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetRegistrationsForExportQuery = { __typename?: 'Query', getRegistrationsByCompetitionId: Array<{ __typename?: 'Registration', id: string, isCheckedIn: boolean, teamName?: string | null, user: { __typename?: 'User', name?: string | null, email: string }, team?: { __typename?: 'Team', name?: string | null } | null, ticketType: { __typename?: 'TicketType', name: string }, registrationAnswers: Array<{ __typename?: 'RegistrationAnswer', answer: string, registrationField?: { __typename?: 'RegistrationField', question: string, type: QuestionType, isEditable: boolean, options?: Array<string> | null } | null }> }> };

export type GetScoreSettingByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetScoreSettingByCompetitionIdQuery = { __typename?: 'Query', getScoreSettingByCompetitionId: { __typename?: 'ScoreSetting', id: string, competitionId: string, penalizeIncomplete: boolean, ticketTypeOrderIds: Array<string>, penalizeScaled: boolean, totalHeatsPerWorkout?: number | null, firstHeatStartTime: any, heatsEveryXMinutes: number, oneTicketPerHeat: boolean, scoring: DivisionScoreType, handleTie: Tiebreaker, heatLimitType: HeatLimitType, maxLimitPerHeat: number, createdAt: any, updatedAt: any } };

export type GetScoreSettingByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetScoreSettingByIdQuery = { __typename?: 'Query', getScoreSettingById: { __typename?: 'ScoreSetting', id: string, competitionId: string, penalizeIncomplete: boolean, penalizeScaled: boolean, scoring: DivisionScoreType, handleTie: Tiebreaker, createdAt: any, updatedAt: any } };

export type GetSentEmailsQueryVariables = Exact<{
  compId: Scalars['String']['input'];
}>;


export type GetSentEmailsQuery = { __typename?: 'Query', getSentEmails: Array<{ __typename?: 'SentEmail', id: string, userId: string, recipients: Array<string>, subject: string, message: string, sentAt: any }> };

export type GetTicketTypesByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetTicketTypesByCompetitionIdQuery = { __typename?: 'Query', getTicketTypesByCompetitionId: Array<{ __typename?: 'TicketType', id: string, name: string, description?: string | null, maxEntries: number, price: number, teamSize: number, currency: Currency, isVolunteer: boolean, competitionId: string, createdAt: any, isTeamNameRequired: boolean, registered: number, allowHeatSelection: boolean, hasAvailability: boolean, registrationFields: Array<{ __typename?: 'RegistrationField', id: string, question: string, type: QuestionType, requiredStatus: RequiredStatus, options?: Array<string> | null }> }> };

export type GetTicketTypeByIdQueryVariables = Exact<{
  ticketId: Scalars['String']['input'];
}>;


export type GetTicketTypeByIdQuery = { __typename?: 'Query', getTicketTypeById?: { __typename?: 'TicketType', id: string, name: string, description?: string | null, maxEntries: number, price: number, teamSize: number, currency: Currency, isVolunteer: boolean, offerEarlyBird: boolean, competitionId: string, createdAt: any, registered: number, updatedAt: any, registrationFields: Array<{ __typename?: 'RegistrationField', id: string, question: string, type: QuestionType, repeatPerAthlete: boolean, requiredStatus: RequiredStatus, options?: Array<string> | null }> } | null };

export type GetTicketTypesIdAndNameByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetTicketTypesIdAndNameByCompetitionIdQuery = { __typename?: 'Query', getTicketTypesByCompetitionId: Array<{ __typename?: 'TicketType', id: string, name: string, isVolunteer: boolean }> };

export type GetUnassignedEntriesByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetUnassignedEntriesByCompetitionIdQuery = { __typename?: 'Query', getUnassignedEntriesByCompetitionId: Array<{ __typename?: 'Entry', id: string, name: string, ticketType: { __typename?: 'TicketType', id: string, name: string, teamSize: number }, team?: { __typename?: 'Team', id: string, members: Array<{ __typename?: 'TeamMember', id: string, user?: { __typename?: 'User', id: string, name?: string | null } | null }> } | null }> };

export type GetUserScheduleQueryVariables = Exact<{
  userId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type GetUserScheduleQuery = { __typename?: 'Query', getUserSchedule: Array<{ __typename?: 'UserScheduleItem', workout: { __typename?: 'Workout', id: string, name: string }, heat: { __typename?: 'Heat', id: string, name: string, startTime: any, lanes: Array<{ __typename?: 'Lane', entry: { __typename?: 'Entry', name: string, team?: { __typename?: 'Team', name?: string | null, members: Array<{ __typename?: 'TeamMember', user?: { __typename?: 'User', name?: string | null } | null }> } | null } }> } }> };

export type GetViewerQueryVariables = Exact<{ [key: string]: never; }>;


export type GetViewerQuery = { __typename?: 'Query', getUser?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string, picture?: string | null, bio?: string | null, isSuperUser: boolean, isVerified: boolean, createdAt: any, updatedAt: any, invitationId?: string | null, referredBy?: string | null, referralCode?: string | null, orgId?: string | null } | null };

export type GetViewerCompsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetViewerCompsQuery = { __typename?: 'Query', getCompetitionsByUser: Array<{ __typename?: 'Competition', id: string, name?: string | null, startDateTime?: any | null, registrationsCount: number }> };

export type GetWorkoutByIdQueryVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GetWorkoutByIdQuery = { __typename?: 'Query', getWorkoutById: { __typename?: 'Workout', id: string, unitOfMeasurement: Unit, scoreType: ScoreType, isVisible: boolean } };

export type GetWorkoutNamesByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetWorkoutNamesByCompetitionIdQuery = { __typename?: 'Query', getWorkoutsByCompetitionId: Array<{ __typename?: 'Workout', id: string, name: string, unitOfMeasurement: Unit, scoreType: ScoreType }> };

export type GetWorkoutsByCompetitionIdQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type GetWorkoutsByCompetitionIdQuery = { __typename?: 'Query', getWorkoutsByCompetitionId: Array<{ __typename?: 'Workout', id: string, name: string, description: string, releaseDateTime: any, competitionId: string, location: string, scoreType: ScoreType, unitOfMeasurement: Unit, timeCap: number, includeStandardsVideo: boolean, createdAt: any, updatedAt: any, isVisible: boolean, videos?: Array<{ __typename?: 'WorkoutVideo', id: string, title: string, description?: string | null, url: string, orderIndex: number } | null> | null, scoreSetting: { __typename?: 'ScoreSetting', id: string, penalizeIncomplete: boolean, penalizeScaled: boolean, handleTie: Tiebreaker } }> };

export type InviteToCompetitionMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type InviteToCompetitionMutation = { __typename?: 'Mutation', inviteToCompetition?: boolean | null };

export type IsUserRegisteredForCompetitionQueryVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type IsUserRegisteredForCompetitionQuery = { __typename?: 'Query', isUserRegisteredForCompetition: boolean };

export type LinkDirectoryCompToCompetitionMutationVariables = Exact<{
  directoryCompId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type LinkDirectoryCompToCompetitionMutation = { __typename?: 'Mutation', linkDirectoryCompToCompetition?: boolean | null };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'LoginResponse', error?: string | null, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string, isSuperUser: boolean, isVerified: boolean, picture?: string | null, createdAt: any, updatedAt: any, invitationId?: string | null, referredBy?: string | null, referralCode?: string | null, orgId?: string | null } | null } | null };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout?: { __typename?: 'LogoutPayload', success?: boolean | null, message?: string | null } | null };

export type MoveAthleteToTeamMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
  targetTeamId: Scalars['String']['input'];
}>;


export type MoveAthleteToTeamMutation = { __typename?: 'Mutation', moveAthleteToTeam?: boolean | null };

export type RejectPotentialCompetitionsMutationVariables = Exact<{
  potentialCompetitionIds: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type RejectPotentialCompetitionsMutation = { __typename?: 'Mutation', rejectPotentialCompetitions?: string | null };

export type RequestDirectoryCompEditMutationVariables = Exact<{
  input: RequestDirectoryCompEditInput;
}>;


export type RequestDirectoryCompEditMutation = { __typename?: 'Mutation', requestDirectoryCompEdit?: boolean | null };

export type ResendInvitationMutationVariables = Exact<{
  invitationId: Scalars['String']['input'];
}>;


export type ResendInvitationMutation = { __typename?: 'Mutation', resendInvitation?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  password: Scalars['String']['input'];
  token: Scalars['String']['input'];
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword?: { __typename?: 'ResetPasswordResponse', success?: boolean | null, error?: string | null } | null };

export type ScheduleDayBeforeEventEmailMutationVariables = Exact<{
  competitionId: Scalars['ID']['input'];
}>;


export type ScheduleDayBeforeEventEmailMutation = { __typename?: 'Mutation', scheduleDayBeforeEventEmail: boolean };

export type SendEmailsMutationVariables = Exact<{
  recipients: Array<Scalars['String']['input']> | Scalars['String']['input'];
  subject: Scalars['String']['input'];
  message: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type SendEmailsMutation = { __typename?: 'Mutation', sendEmails?: boolean | null };

export type SendInvitationsMutationVariables = Exact<{
  emails: Array<Scalars['String']['input']> | Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type SendInvitationsMutation = { __typename?: 'Mutation', sendInvitations?: boolean | null };

export type SendLoginTokenMutationVariables = Exact<{
  input: SendLoginTokenInput;
}>;


export type SendLoginTokenMutation = { __typename?: 'Mutation', sendLoginToken: boolean };

export type SignUpMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp?: { __typename?: 'SignupResponse', error?: string | null, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string, isSuperUser: boolean, isVerified: boolean, picture?: string | null, bio?: string | null, createdAt: any, updatedAt: any, invitationId?: string | null, referredBy?: string | null, referralCode?: string | null, orgId?: string | null } | null } | null };

export type SubmitFeedbackMutationVariables = Exact<{
  text: Scalars['String']['input'];
}>;


export type SubmitFeedbackMutation = { __typename?: 'Mutation', submitFeedback?: { __typename?: 'Feedback', id?: string | null, text?: string | null, createdAt?: any | null } | null };

export type SuggestCompetitionEditMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type SuggestCompetitionEditMutation = { __typename?: 'Mutation', suggestCompetitionEdit?: string | null };

export type SuggestNewCompetitionMutationVariables = Exact<{
  name: Scalars['String']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  startDate?: InputMaybe<Scalars['String']['input']>;
  endDate?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  reason?: InputMaybe<Scalars['String']['input']>;
}>;


export type SuggestNewCompetitionMutation = { __typename?: 'Mutation', suggestNewCompetition?: string | null };

export type UnassignAllEntriesMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
}>;


export type UnassignAllEntriesMutation = { __typename?: 'Mutation', unassignAllEntries: boolean };

export type UnassignEntryMutationVariables = Exact<{
  laneId: Scalars['String']['input'];
}>;


export type UnassignEntryMutation = { __typename?: 'Mutation', unassignEntry?: { __typename?: 'Lane', id: string, entryId: string, heatId: string } | null };

export type UnlinkDirectoryCompFromCompetitionMutationVariables = Exact<{
  directoryCompId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
}>;


export type UnlinkDirectoryCompFromCompetitionMutation = { __typename?: 'Mutation', unlinkDirectoryCompFromCompetition?: boolean | null };

export type UpdateCompetitionMutationVariables = Exact<{
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  types?: InputMaybe<Array<CompetitionType> | CompetitionType>;
  description?: InputMaybe<Scalars['String']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  postcode?: InputMaybe<Scalars['String']['input']>;
  orgName?: InputMaybe<Scalars['String']['input']>;
  facebook?: InputMaybe<Scalars['String']['input']>;
  instagram?: InputMaybe<Scalars['String']['input']>;
  twitter?: InputMaybe<Scalars['String']['input']>;
  youtube?: InputMaybe<Scalars['String']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  registrationEnabled?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type UpdateCompetitionMutation = { __typename?: 'Mutation', updateCompetition?: { __typename?: 'Competition', id: string, name?: string | null, types?: Array<CompetitionType | null> | null, description?: string | null, orgName?: string | null, registrationEnabled: boolean, createdAt?: any | null, updatedAt?: any | null } | null };

export type UpdateDirectoryCompMutationVariables = Exact<{
  input: UpdateDirectoryCompInput;
}>;


export type UpdateDirectoryCompMutation = { __typename?: 'Mutation', updateDirectoryComp?: { __typename?: 'DirectoryComp', id: string, title: string, location: string, country: string, price?: number | null, currency?: Currency | null, startDate: any, endDate?: any | null, website?: string | null, ticketWebsite?: string | null, ctaLink?: string | null, email?: string | null, logo?: string | null, instagramHandle?: string | null, categories?: Array<{ __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, isSoldOut: boolean, tags?: Array<string | null> | null }> | null } | null };

export type UpdateEarlyBirdMutationVariables = Exact<{
  earlyBird: EarlyBirdInput;
}>;


export type UpdateEarlyBirdMutation = { __typename?: 'Mutation', updateEarlyBird?: { __typename?: 'EarlyBird', id: string } | null };

export type UpdateHeatMutationVariables = Exact<{
  id: Scalars['String']['input'];
  startTime?: InputMaybe<Scalars['DateTime']['input']>;
  ticketTypeIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
  maxLimitPerHeat?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UpdateHeatMutation = { __typename?: 'Mutation', updateHeat?: { __typename?: 'Heat', id: string, startTime: any, workoutId: string } | null };

export type UpdateHeatLimitsMutationVariables = Exact<{
  input: Array<UpdateHeatLimitsInput> | UpdateHeatLimitsInput;
}>;


export type UpdateHeatLimitsMutation = { __typename?: 'Mutation', updateHeatLimits: Array<{ __typename?: 'Heat', id: string, maxLimitPerHeat: number, name: string }> };

export type UpdateInvitationMutationVariables = Exact<{
  id: Scalars['String']['input'];
  email: Scalars['String']['input'];
}>;


export type UpdateInvitationMutation = { __typename?: 'Mutation', updateInvitation?: { __typename?: 'Invitation', id: string, email?: string | null, updatedAt: any } | null };

export type UpdateLaneHeatMutationVariables = Exact<{
  id: Scalars['String']['input'];
  heatId: Scalars['String']['input'];
}>;


export type UpdateLaneHeatMutation = { __typename?: 'Mutation', updateLaneHeat?: { __typename?: 'Lane', id: string, number: number, entryId: string, heatId: string, createdAt: any, updatedAt: any } | null };

export type UpdateLaneOrderMutationVariables = Exact<{
  laneId: Scalars['String']['input'];
  newPosition: Scalars['Int']['input'];
}>;


export type UpdateLaneOrderMutation = { __typename?: 'Mutation', updateLaneOrder?: { __typename?: 'Lane', id: string, number: number, entryId: string, heatId: string, createdAt: any, updatedAt: any } | null };

export type UpdateNotificationSubscriptionMutationVariables = Exact<{
  input: UpdateNotificationSubscriptionInput;
}>;


export type UpdateNotificationSubscriptionMutation = { __typename?: 'Mutation', updateNotificationSubscription?: { __typename?: 'NotificationSubscription', id: string, email: string, eventType?: string | null, countries?: Array<string | null> | null, locations?: Array<string | null> | null, tags?: Array<string> | null } | null };

export type UpdatePartnerInterestMutationVariables = Exact<{
  id: Scalars['String']['input'];
  categoryId?: InputMaybe<Scalars['String']['input']>;
  ticketTypeId?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdatePartnerInterestMutation = { __typename?: 'Mutation', updatePartnerInterest?: { __typename?: 'PartnerInterest', id: string, userId: string, interestType: PartnerInterestType, partnerPreference: PartnerPreference, categoryId?: string | null, ticketTypeId?: string | null, description?: string | null, status: string, createdAt: any, updatedAt: any, user?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, picture?: string | null } | null, category?: { __typename?: 'Category', id: string, difficulty: Difficulty, gender: Gender, teamSize: number, isSoldOut: boolean, tags?: Array<string | null> | null } | null } | null };

export type UpdatePartnerRequestMutationVariables = Exact<{
  input: UpdatePartnerRequestInput;
}>;


export type UpdatePartnerRequestMutation = { __typename?: 'Mutation', updatePartnerRequest?: { __typename?: 'PartnerRequest', id: string, fromInterestId?: string | null, fromUserId?: string | null, toInterestId: string, message?: string | null, status: PartnerRequestStatus, createdAt: any, updatedAt: any, fromUser?: { __typename?: 'User', id: string, name?: string | null, picture?: string | null } | null, fromInterest?: { __typename?: 'PartnerInterest', id: string, userId: string } | null, toInterest?: { __typename?: 'PartnerInterest', id: string, userId: string } | null } | null };

export type UpdatePotentialCompetitionMutationVariables = Exact<{
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  startDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  endDateTime?: InputMaybe<Scalars['DateTime']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  instagramHandle?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Float']['input']>;
  currency?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  region?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdatePotentialCompetitionMutation = { __typename?: 'Mutation', updatePotentialCompetition?: string | null };

export type UpdateRegistrationFieldMutationVariables = Exact<{
  id: Scalars['String']['input'];
  question?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<QuestionType>;
  requiredStatus?: InputMaybe<RequiredStatus>;
  options?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  repeatPerAthlete?: InputMaybe<Scalars['Boolean']['input']>;
  ticketTypeIds?: InputMaybe<Array<Scalars['String']['input']> | Scalars['String']['input']>;
}>;


export type UpdateRegistrationFieldMutation = { __typename?: 'Mutation', updateRegistrationField?: { __typename?: 'RegistrationField', id: string, question: string, type: QuestionType, requiredStatus: RequiredStatus, options?: Array<string> | null, repeatPerAthlete: boolean } | null };

export type UpdateScoreByIdMutationVariables = Exact<{
  id: Scalars['String']['input'];
  value: Scalars['String']['input'];
  isCompleted: Scalars['Boolean']['input'];
  scorecard?: InputMaybe<Scalars['String']['input']>;
  note?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateScoreByIdMutation = { __typename?: 'Mutation', updateScoreById: { __typename?: 'Score', id: string, value: string, isCompleted: boolean, scorecard?: string | null, note?: string | null, createdAt: any, updatedAt: any } };

export type UpdateTeamMutationVariables = Exact<{
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
}>;


export type UpdateTeamMutation = { __typename?: 'Mutation', updateTeam?: { __typename?: 'Team', id: string, name?: string | null } | null };

export type UpdateTicketTypeMutationVariables = Exact<{
  input: UpdateTicketTypeInput;
}>;


export type UpdateTicketTypeMutation = { __typename?: 'Mutation', updateTicketType?: { __typename?: 'TicketType', id: string, name: string } | null };

export type UpdateUserMutationVariables = Exact<{
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', id: string, email: string, firstName: string, lastName?: string | null, picture?: string | null, bio?: string | null, isSuperUser: boolean, isVerified: boolean } | null };

export type UpdateUserBioMutationVariables = Exact<{
  bio: Scalars['String']['input'];
}>;


export type UpdateUserBioMutation = { __typename?: 'Mutation', updateUserBio?: { __typename?: 'User', id: string, email: string, firstName: string, lastName?: string | null, picture?: string | null, bio?: string | null, isSuperUser: boolean, isVerified: boolean, createdAt: any, updatedAt: any } | null };

export type UpdateUserByIdMutationVariables = Exact<{
  userId: Scalars['String']['input'];
  competitionId: Scalars['String']['input'];
  firstName?: InputMaybe<Scalars['String']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
}>;


export type UpdateUserByIdMutation = { __typename?: 'Mutation', updateUserById?: { __typename?: 'User', id: string, email: string, firstName: string, lastName?: string | null, name?: string | null } | null };

export type UpdateWorkoutMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: UpdateWorkoutInput;
}>;


export type UpdateWorkoutMutation = { __typename?: 'Mutation', updateWorkout?: { __typename?: 'Workout', id: string, name: string, description: string, releaseDateTime: any, competitionId: string, location: string, scoreType: ScoreType, unitOfMeasurement: Unit, timeCap: number, includeStandardsVideo: boolean, createdAt: any, updatedAt: any, videos?: Array<{ __typename?: 'WorkoutVideo', id: string, title: string, description?: string | null, url: string, orderIndex: number } | null> | null } | null };

export type UpdateWorkoutVisibilityMutationVariables = Exact<{
  id: Scalars['String']['input'];
  isVisible: Scalars['Boolean']['input'];
}>;


export type UpdateWorkoutVisibilityMutation = { __typename?: 'Mutation', updateWorkoutVisibility?: { __typename?: 'Workout', id: string, name: string, isVisible: boolean } | null };

export type UploadCompetitionLogoMutationVariables = Exact<{
  competitionId: Scalars['String']['input'];
  image: Scalars['String']['input'];
}>;


export type UploadCompetitionLogoMutation = { __typename?: 'Mutation', uploadCompetitionLogo?: { __typename?: 'Competition', id: string, name?: string | null, logo?: string | null } | null };

export type UploadOrgImageMutationVariables = Exact<{
  orgId: Scalars['String']['input'];
  image: Scalars['String']['input'];
}>;


export type UploadOrgImageMutation = { __typename?: 'Mutation', uploadOrgImage?: { __typename?: 'Org', id?: string | null, name?: string | null } | null };

export type UploadUserAvatarMutationVariables = Exact<{
  image: Scalars['String']['input'];
}>;


export type UploadUserAvatarMutation = { __typename?: 'Mutation', uploadUserAvatar?: { __typename?: 'User', id: string, firstName: string, lastName?: string | null, email: string, isSuperUser: boolean, isVerified: boolean, picture?: string | null, bio?: string | null, createdAt: any, updatedAt: any, invitationId?: string | null, referredBy?: string | null, referralCode?: string | null, orgId?: string | null } | null };


export const AcceptCompetitionInvitationDocument = gql`
    mutation AcceptCompetitionInvitation($token: String!) {
  acceptCompetitionInvitation(token: $token)
}
    `;
export type AcceptCompetitionInvitationMutationFn = Apollo.MutationFunction<AcceptCompetitionInvitationMutation, AcceptCompetitionInvitationMutationVariables>;

/**
 * __useAcceptCompetitionInvitationMutation__
 *
 * To run a mutation, you first call `useAcceptCompetitionInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAcceptCompetitionInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [acceptCompetitionInvitationMutation, { data, loading, error }] = useAcceptCompetitionInvitationMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useAcceptCompetitionInvitationMutation(baseOptions?: Apollo.MutationHookOptions<AcceptCompetitionInvitationMutation, AcceptCompetitionInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AcceptCompetitionInvitationMutation, AcceptCompetitionInvitationMutationVariables>(AcceptCompetitionInvitationDocument, options);
      }
export type AcceptCompetitionInvitationMutationHookResult = ReturnType<typeof useAcceptCompetitionInvitationMutation>;
export type AcceptCompetitionInvitationMutationResult = Apollo.MutationResult<AcceptCompetitionInvitationMutation>;
export type AcceptCompetitionInvitationMutationOptions = Apollo.BaseMutationOptions<AcceptCompetitionInvitationMutation, AcceptCompetitionInvitationMutationVariables>;
export const AddDirectoryCompDocument = gql`
    mutation AddDirectoryComp($input: AddDirectoryCompInput!) {
  addDirectoryComp(input: $input)
}
    `;
export type AddDirectoryCompMutationFn = Apollo.MutationFunction<AddDirectoryCompMutation, AddDirectoryCompMutationVariables>;

/**
 * __useAddDirectoryCompMutation__
 *
 * To run a mutation, you first call `useAddDirectoryCompMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddDirectoryCompMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addDirectoryCompMutation, { data, loading, error }] = useAddDirectoryCompMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddDirectoryCompMutation(baseOptions?: Apollo.MutationHookOptions<AddDirectoryCompMutation, AddDirectoryCompMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AddDirectoryCompMutation, AddDirectoryCompMutationVariables>(AddDirectoryCompDocument, options);
      }
export type AddDirectoryCompMutationHookResult = ReturnType<typeof useAddDirectoryCompMutation>;
export type AddDirectoryCompMutationResult = Apollo.MutationResult<AddDirectoryCompMutation>;
export type AddDirectoryCompMutationOptions = Apollo.BaseMutationOptions<AddDirectoryCompMutation, AddDirectoryCompMutationVariables>;
export const ApprovePotentialCompetitionsDocument = gql`
    mutation ApprovePotentialCompetitions($potentialCompetitionIds: [String!]!) {
  approvePotentialCompetitions(potentialCompetitionIds: $potentialCompetitionIds)
}
    `;
export type ApprovePotentialCompetitionsMutationFn = Apollo.MutationFunction<ApprovePotentialCompetitionsMutation, ApprovePotentialCompetitionsMutationVariables>;

/**
 * __useApprovePotentialCompetitionsMutation__
 *
 * To run a mutation, you first call `useApprovePotentialCompetitionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useApprovePotentialCompetitionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [approvePotentialCompetitionsMutation, { data, loading, error }] = useApprovePotentialCompetitionsMutation({
 *   variables: {
 *      potentialCompetitionIds: // value for 'potentialCompetitionIds'
 *   },
 * });
 */
export function useApprovePotentialCompetitionsMutation(baseOptions?: Apollo.MutationHookOptions<ApprovePotentialCompetitionsMutation, ApprovePotentialCompetitionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ApprovePotentialCompetitionsMutation, ApprovePotentialCompetitionsMutationVariables>(ApprovePotentialCompetitionsDocument, options);
      }
export type ApprovePotentialCompetitionsMutationHookResult = ReturnType<typeof useApprovePotentialCompetitionsMutation>;
export type ApprovePotentialCompetitionsMutationResult = Apollo.MutationResult<ApprovePotentialCompetitionsMutation>;
export type ApprovePotentialCompetitionsMutationOptions = Apollo.BaseMutationOptions<ApprovePotentialCompetitionsMutation, ApprovePotentialCompetitionsMutationVariables>;
export const AssignEntryToHeatDocument = gql`
    mutation AssignEntryToHeat($entryId: String!, $heatId: String!) {
  assignEntryToHeat(entryId: $entryId, heatId: $heatId) {
    id
    number
    heatId
    entryId
  }
}
    `;
export type AssignEntryToHeatMutationFn = Apollo.MutationFunction<AssignEntryToHeatMutation, AssignEntryToHeatMutationVariables>;

/**
 * __useAssignEntryToHeatMutation__
 *
 * To run a mutation, you first call `useAssignEntryToHeatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAssignEntryToHeatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [assignEntryToHeatMutation, { data, loading, error }] = useAssignEntryToHeatMutation({
 *   variables: {
 *      entryId: // value for 'entryId'
 *      heatId: // value for 'heatId'
 *   },
 * });
 */
export function useAssignEntryToHeatMutation(baseOptions?: Apollo.MutationHookOptions<AssignEntryToHeatMutation, AssignEntryToHeatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<AssignEntryToHeatMutation, AssignEntryToHeatMutationVariables>(AssignEntryToHeatDocument, options);
      }
export type AssignEntryToHeatMutationHookResult = ReturnType<typeof useAssignEntryToHeatMutation>;
export type AssignEntryToHeatMutationResult = Apollo.MutationResult<AssignEntryToHeatMutation>;
export type AssignEntryToHeatMutationOptions = Apollo.BaseMutationOptions<AssignEntryToHeatMutation, AssignEntryToHeatMutationVariables>;
export const CheckInAthleteDocument = gql`
    mutation CheckInAthlete($registrationId: String!, $isCheckedIn: Boolean!) {
  checkInAthlete(registrationId: $registrationId, isCheckedIn: $isCheckedIn) {
    id
    userId
    isCheckedIn
    competitionId
  }
}
    `;
export type CheckInAthleteMutationFn = Apollo.MutationFunction<CheckInAthleteMutation, CheckInAthleteMutationVariables>;

/**
 * __useCheckInAthleteMutation__
 *
 * To run a mutation, you first call `useCheckInAthleteMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCheckInAthleteMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [checkInAthleteMutation, { data, loading, error }] = useCheckInAthleteMutation({
 *   variables: {
 *      registrationId: // value for 'registrationId'
 *      isCheckedIn: // value for 'isCheckedIn'
 *   },
 * });
 */
export function useCheckInAthleteMutation(baseOptions?: Apollo.MutationHookOptions<CheckInAthleteMutation, CheckInAthleteMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CheckInAthleteMutation, CheckInAthleteMutationVariables>(CheckInAthleteDocument, options);
      }
export type CheckInAthleteMutationHookResult = ReturnType<typeof useCheckInAthleteMutation>;
export type CheckInAthleteMutationResult = Apollo.MutationResult<CheckInAthleteMutation>;
export type CheckInAthleteMutationOptions = Apollo.BaseMutationOptions<CheckInAthleteMutation, CheckInAthleteMutationVariables>;
export const CheckReferralCodeDocument = gql`
    query CheckReferralCode($referralCode: String!) {
  checkReferralCode(referralCode: $referralCode)
}
    `;

/**
 * __useCheckReferralCodeQuery__
 *
 * To run a query within a React component, call `useCheckReferralCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckReferralCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckReferralCodeQuery({
 *   variables: {
 *      referralCode: // value for 'referralCode'
 *   },
 * });
 */
export function useCheckReferralCodeQuery(baseOptions: Apollo.QueryHookOptions<CheckReferralCodeQuery, CheckReferralCodeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<CheckReferralCodeQuery, CheckReferralCodeQueryVariables>(CheckReferralCodeDocument, options);
      }
export function useCheckReferralCodeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<CheckReferralCodeQuery, CheckReferralCodeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<CheckReferralCodeQuery, CheckReferralCodeQueryVariables>(CheckReferralCodeDocument, options);
        }
export type CheckReferralCodeQueryHookResult = ReturnType<typeof useCheckReferralCodeQuery>;
export type CheckReferralCodeLazyQueryHookResult = ReturnType<typeof useCheckReferralCodeLazyQuery>;
export type CheckReferralCodeQueryResult = Apollo.QueryResult<CheckReferralCodeQuery, CheckReferralCodeQueryVariables>;
export const CloneCompetitionDocument = gql`
    mutation CloneCompetition($id: String!) {
  cloneCompetition(id: $id) {
    id
    name
    startDateTime
    endDateTime
    registrationsCount
  }
}
    `;
export type CloneCompetitionMutationFn = Apollo.MutationFunction<CloneCompetitionMutation, CloneCompetitionMutationVariables>;

/**
 * __useCloneCompetitionMutation__
 *
 * To run a mutation, you first call `useCloneCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCloneCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cloneCompetitionMutation, { data, loading, error }] = useCloneCompetitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCloneCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<CloneCompetitionMutation, CloneCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CloneCompetitionMutation, CloneCompetitionMutationVariables>(CloneCompetitionDocument, options);
      }
export type CloneCompetitionMutationHookResult = ReturnType<typeof useCloneCompetitionMutation>;
export type CloneCompetitionMutationResult = Apollo.MutationResult<CloneCompetitionMutation>;
export type CloneCompetitionMutationOptions = Apollo.BaseMutationOptions<CloneCompetitionMutation, CloneCompetitionMutationVariables>;
export const CreateBreakDocument = gql`
    mutation CreateBreak($input: CreateBreakInput!) {
  createBreak(input: $input)
}
    `;
export type CreateBreakMutationFn = Apollo.MutationFunction<CreateBreakMutation, CreateBreakMutationVariables>;

/**
 * __useCreateBreakMutation__
 *
 * To run a mutation, you first call `useCreateBreakMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBreakMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBreakMutation, { data, loading, error }] = useCreateBreakMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBreakMutation(baseOptions?: Apollo.MutationHookOptions<CreateBreakMutation, CreateBreakMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBreakMutation, CreateBreakMutationVariables>(CreateBreakDocument, options);
      }
export type CreateBreakMutationHookResult = ReturnType<typeof useCreateBreakMutation>;
export type CreateBreakMutationResult = Apollo.MutationResult<CreateBreakMutation>;
export type CreateBreakMutationOptions = Apollo.BaseMutationOptions<CreateBreakMutation, CreateBreakMutationVariables>;
export const CreateBulkRegistrationsDocument = gql`
    mutation CreateBulkRegistrations($input: [BulkRegistrationInput!]!) {
  createBulkRegistrations(input: $input) {
    id
    email
    firstName
    lastName
  }
}
    `;
export type CreateBulkRegistrationsMutationFn = Apollo.MutationFunction<CreateBulkRegistrationsMutation, CreateBulkRegistrationsMutationVariables>;

/**
 * __useCreateBulkRegistrationsMutation__
 *
 * To run a mutation, you first call `useCreateBulkRegistrationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateBulkRegistrationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createBulkRegistrationsMutation, { data, loading, error }] = useCreateBulkRegistrationsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateBulkRegistrationsMutation(baseOptions?: Apollo.MutationHookOptions<CreateBulkRegistrationsMutation, CreateBulkRegistrationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateBulkRegistrationsMutation, CreateBulkRegistrationsMutationVariables>(CreateBulkRegistrationsDocument, options);
      }
export type CreateBulkRegistrationsMutationHookResult = ReturnType<typeof useCreateBulkRegistrationsMutation>;
export type CreateBulkRegistrationsMutationResult = Apollo.MutationResult<CreateBulkRegistrationsMutation>;
export type CreateBulkRegistrationsMutationOptions = Apollo.BaseMutationOptions<CreateBulkRegistrationsMutation, CreateBulkRegistrationsMutationVariables>;
export const CreateCompDocument = gql`
    mutation CreateComp($name: String!, $startDateTime: DateTime!, $endDateTime: DateTime!, $numberOfWorkouts: Int!, $timezone: String, $orgName: String) {
  createComp(
    name: $name
    startDateTime: $startDateTime
    endDateTime: $endDateTime
    numberOfWorkouts: $numberOfWorkouts
    timezone: $timezone
    orgName: $orgName
  ) {
    competition {
      id
      name
      startDateTime
      endDateTime
      timezone
      orgName
      description
      createdAt
      updatedAt
    }
    message
  }
}
    `;
export type CreateCompMutationFn = Apollo.MutationFunction<CreateCompMutation, CreateCompMutationVariables>;

/**
 * __useCreateCompMutation__
 *
 * To run a mutation, you first call `useCreateCompMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCompMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCompMutation, { data, loading, error }] = useCreateCompMutation({
 *   variables: {
 *      name: // value for 'name'
 *      startDateTime: // value for 'startDateTime'
 *      endDateTime: // value for 'endDateTime'
 *      numberOfWorkouts: // value for 'numberOfWorkouts'
 *      timezone: // value for 'timezone'
 *      orgName: // value for 'orgName'
 *   },
 * });
 */
export function useCreateCompMutation(baseOptions?: Apollo.MutationHookOptions<CreateCompMutation, CreateCompMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateCompMutation, CreateCompMutationVariables>(CreateCompDocument, options);
      }
export type CreateCompMutationHookResult = ReturnType<typeof useCreateCompMutation>;
export type CreateCompMutationResult = Apollo.MutationResult<CreateCompMutation>;
export type CreateCompMutationOptions = Apollo.BaseMutationOptions<CreateCompMutation, CreateCompMutationVariables>;
export const CreateHeatsDocument = gql`
    mutation CreateHeats($input: [CreateHeatInput!]!, $competitionId: String!) {
  createHeats(input: $input, competitionId: $competitionId) {
    id
    startTime
    workoutId
    name
  }
}
    `;
export type CreateHeatsMutationFn = Apollo.MutationFunction<CreateHeatsMutation, CreateHeatsMutationVariables>;

/**
 * __useCreateHeatsMutation__
 *
 * To run a mutation, you first call `useCreateHeatsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateHeatsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createHeatsMutation, { data, loading, error }] = useCreateHeatsMutation({
 *   variables: {
 *      input: // value for 'input'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useCreateHeatsMutation(baseOptions?: Apollo.MutationHookOptions<CreateHeatsMutation, CreateHeatsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateHeatsMutation, CreateHeatsMutationVariables>(CreateHeatsDocument, options);
      }
export type CreateHeatsMutationHookResult = ReturnType<typeof useCreateHeatsMutation>;
export type CreateHeatsMutationResult = Apollo.MutationResult<CreateHeatsMutation>;
export type CreateHeatsMutationOptions = Apollo.BaseMutationOptions<CreateHeatsMutation, CreateHeatsMutationVariables>;
export const CreateNotificationSubscriptionDocument = gql`
    mutation CreateNotificationSubscription($input: CreateNotificationSubscriptionInput!) {
  createNotificationSubscription(input: $input) {
    id
    email
    eventType
    countries
    locations
    tags
  }
}
    `;
export type CreateNotificationSubscriptionMutationFn = Apollo.MutationFunction<CreateNotificationSubscriptionMutation, CreateNotificationSubscriptionMutationVariables>;

/**
 * __useCreateNotificationSubscriptionMutation__
 *
 * To run a mutation, you first call `useCreateNotificationSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateNotificationSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createNotificationSubscriptionMutation, { data, loading, error }] = useCreateNotificationSubscriptionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateNotificationSubscriptionMutation(baseOptions?: Apollo.MutationHookOptions<CreateNotificationSubscriptionMutation, CreateNotificationSubscriptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateNotificationSubscriptionMutation, CreateNotificationSubscriptionMutationVariables>(CreateNotificationSubscriptionDocument, options);
      }
export type CreateNotificationSubscriptionMutationHookResult = ReturnType<typeof useCreateNotificationSubscriptionMutation>;
export type CreateNotificationSubscriptionMutationResult = Apollo.MutationResult<CreateNotificationSubscriptionMutation>;
export type CreateNotificationSubscriptionMutationOptions = Apollo.BaseMutationOptions<CreateNotificationSubscriptionMutation, CreateNotificationSubscriptionMutationVariables>;
export const CreatePartnerInterestDocument = gql`
    mutation CreatePartnerInterest($input: CreatePartnerInterestInput!) {
  createPartnerInterest(input: $input) {
    id
    userId
    interestType
    partnerPreference
    categoryId
    ticketTypeId
    description
    phone
    instagram
    status
    createdAt
    updatedAt
    user {
      id
      name
      picture
    }
    category {
      id
      difficulty
      gender
      teamSize
      isSoldOut
      tags
    }
  }
}
    `;
export type CreatePartnerInterestMutationFn = Apollo.MutationFunction<CreatePartnerInterestMutation, CreatePartnerInterestMutationVariables>;

/**
 * __useCreatePartnerInterestMutation__
 *
 * To run a mutation, you first call `useCreatePartnerInterestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePartnerInterestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPartnerInterestMutation, { data, loading, error }] = useCreatePartnerInterestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePartnerInterestMutation(baseOptions?: Apollo.MutationHookOptions<CreatePartnerInterestMutation, CreatePartnerInterestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePartnerInterestMutation, CreatePartnerInterestMutationVariables>(CreatePartnerInterestDocument, options);
      }
export type CreatePartnerInterestMutationHookResult = ReturnType<typeof useCreatePartnerInterestMutation>;
export type CreatePartnerInterestMutationResult = Apollo.MutationResult<CreatePartnerInterestMutation>;
export type CreatePartnerInterestMutationOptions = Apollo.BaseMutationOptions<CreatePartnerInterestMutation, CreatePartnerInterestMutationVariables>;
export const CreatePartnerInterestTeamMembersDocument = gql`
    mutation CreatePartnerInterestTeamMembers($partnerInterestId: String!, $teamMembers: [Json!]!) {
  createPartnerInterestTeamMembers(
    partnerInterestId: $partnerInterestId
    teamMembers: $teamMembers
  ) {
    id
    partnerInterestId
    name
    email
    userId
    status
    invitationToken
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
      picture
    }
  }
}
    `;
export type CreatePartnerInterestTeamMembersMutationFn = Apollo.MutationFunction<CreatePartnerInterestTeamMembersMutation, CreatePartnerInterestTeamMembersMutationVariables>;

/**
 * __useCreatePartnerInterestTeamMembersMutation__
 *
 * To run a mutation, you first call `useCreatePartnerInterestTeamMembersMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePartnerInterestTeamMembersMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPartnerInterestTeamMembersMutation, { data, loading, error }] = useCreatePartnerInterestTeamMembersMutation({
 *   variables: {
 *      partnerInterestId: // value for 'partnerInterestId'
 *      teamMembers: // value for 'teamMembers'
 *   },
 * });
 */
export function useCreatePartnerInterestTeamMembersMutation(baseOptions?: Apollo.MutationHookOptions<CreatePartnerInterestTeamMembersMutation, CreatePartnerInterestTeamMembersMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePartnerInterestTeamMembersMutation, CreatePartnerInterestTeamMembersMutationVariables>(CreatePartnerInterestTeamMembersDocument, options);
      }
export type CreatePartnerInterestTeamMembersMutationHookResult = ReturnType<typeof useCreatePartnerInterestTeamMembersMutation>;
export type CreatePartnerInterestTeamMembersMutationResult = Apollo.MutationResult<CreatePartnerInterestTeamMembersMutation>;
export type CreatePartnerInterestTeamMembersMutationOptions = Apollo.BaseMutationOptions<CreatePartnerInterestTeamMembersMutation, CreatePartnerInterestTeamMembersMutationVariables>;
export const CreatePartnerRequestDocument = gql`
    mutation CreatePartnerRequest($input: CreatePartnerRequestInput!) {
  createPartnerRequest(input: $input) {
    id
    fromInterestId
    fromUserId
    toInterestId
    message
    status
    instagram
    createdAt
    updatedAt
    fromInterest {
      id
      userId
      user {
        id
        name
        picture
      }
      categoryId
    }
    fromUser {
      id
      name
      picture
    }
    toInterest {
      id
      userId
      user {
        id
        name
        picture
      }
      categoryId
    }
  }
}
    `;
export type CreatePartnerRequestMutationFn = Apollo.MutationFunction<CreatePartnerRequestMutation, CreatePartnerRequestMutationVariables>;

/**
 * __useCreatePartnerRequestMutation__
 *
 * To run a mutation, you first call `useCreatePartnerRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePartnerRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPartnerRequestMutation, { data, loading, error }] = useCreatePartnerRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePartnerRequestMutation(baseOptions?: Apollo.MutationHookOptions<CreatePartnerRequestMutation, CreatePartnerRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePartnerRequestMutation, CreatePartnerRequestMutationVariables>(CreatePartnerRequestDocument, options);
      }
export type CreatePartnerRequestMutationHookResult = ReturnType<typeof useCreatePartnerRequestMutation>;
export type CreatePartnerRequestMutationResult = Apollo.MutationResult<CreatePartnerRequestMutation>;
export type CreatePartnerRequestMutationOptions = Apollo.BaseMutationOptions<CreatePartnerRequestMutation, CreatePartnerRequestMutationVariables>;
export const CreatePaymentLinkDocument = gql`
    mutation CreatePaymentLink($input: CreatePaymentLinkInput!) {
  createPaymentLink(input: $input)
}
    `;
export type CreatePaymentLinkMutationFn = Apollo.MutationFunction<CreatePaymentLinkMutation, CreatePaymentLinkMutationVariables>;

/**
 * __useCreatePaymentLinkMutation__
 *
 * To run a mutation, you first call `useCreatePaymentLinkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePaymentLinkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPaymentLinkMutation, { data, loading, error }] = useCreatePaymentLinkMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreatePaymentLinkMutation(baseOptions?: Apollo.MutationHookOptions<CreatePaymentLinkMutation, CreatePaymentLinkMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreatePaymentLinkMutation, CreatePaymentLinkMutationVariables>(CreatePaymentLinkDocument, options);
      }
export type CreatePaymentLinkMutationHookResult = ReturnType<typeof useCreatePaymentLinkMutation>;
export type CreatePaymentLinkMutationResult = Apollo.MutationResult<CreatePaymentLinkMutation>;
export type CreatePaymentLinkMutationOptions = Apollo.BaseMutationOptions<CreatePaymentLinkMutation, CreatePaymentLinkMutationVariables>;
export const CreateRegistrationDocument = gql`
    mutation CreateRegistration($input: CreateRegistrationInput!) {
  createRegistration(input: $input) {
    id
    firstName
    lastName
    email
  }
}
    `;
export type CreateRegistrationMutationFn = Apollo.MutationFunction<CreateRegistrationMutation, CreateRegistrationMutationVariables>;

/**
 * __useCreateRegistrationMutation__
 *
 * To run a mutation, you first call `useCreateRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRegistrationMutation, { data, loading, error }] = useCreateRegistrationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateRegistrationMutation(baseOptions?: Apollo.MutationHookOptions<CreateRegistrationMutation, CreateRegistrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRegistrationMutation, CreateRegistrationMutationVariables>(CreateRegistrationDocument, options);
      }
export type CreateRegistrationMutationHookResult = ReturnType<typeof useCreateRegistrationMutation>;
export type CreateRegistrationMutationResult = Apollo.MutationResult<CreateRegistrationMutation>;
export type CreateRegistrationMutationOptions = Apollo.BaseMutationOptions<CreateRegistrationMutation, CreateRegistrationMutationVariables>;
export const CreateRegistrationFieldDocument = gql`
    mutation CreateRegistrationField($ticketTypeIds: [String!]!, $registrationField: RegistrationFieldInput!) {
  createRegistrationField(
    ticketTypeIds: $ticketTypeIds
    registrationField: $registrationField
  ) {
    id
    question
    type
    requiredStatus
    options
  }
}
    `;
export type CreateRegistrationFieldMutationFn = Apollo.MutationFunction<CreateRegistrationFieldMutation, CreateRegistrationFieldMutationVariables>;

/**
 * __useCreateRegistrationFieldMutation__
 *
 * To run a mutation, you first call `useCreateRegistrationFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateRegistrationFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createRegistrationFieldMutation, { data, loading, error }] = useCreateRegistrationFieldMutation({
 *   variables: {
 *      ticketTypeIds: // value for 'ticketTypeIds'
 *      registrationField: // value for 'registrationField'
 *   },
 * });
 */
export function useCreateRegistrationFieldMutation(baseOptions?: Apollo.MutationHookOptions<CreateRegistrationFieldMutation, CreateRegistrationFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateRegistrationFieldMutation, CreateRegistrationFieldMutationVariables>(CreateRegistrationFieldDocument, options);
      }
export type CreateRegistrationFieldMutationHookResult = ReturnType<typeof useCreateRegistrationFieldMutation>;
export type CreateRegistrationFieldMutationResult = Apollo.MutationResult<CreateRegistrationFieldMutation>;
export type CreateRegistrationFieldMutationOptions = Apollo.BaseMutationOptions<CreateRegistrationFieldMutation, CreateRegistrationFieldMutationVariables>;
export const CreateScoreDocument = gql`
    mutation CreateScore($value: String!, $laneId: String!, $isCompleted: Boolean!, $scorecard: String, $note: String) {
  createScore(
    value: $value
    laneId: $laneId
    isCompleted: $isCompleted
    scorecard: $scorecard
    note: $note
  ) {
    id
    value
    isCompleted
  }
}
    `;
export type CreateScoreMutationFn = Apollo.MutationFunction<CreateScoreMutation, CreateScoreMutationVariables>;

/**
 * __useCreateScoreMutation__
 *
 * To run a mutation, you first call `useCreateScoreMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateScoreMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createScoreMutation, { data, loading, error }] = useCreateScoreMutation({
 *   variables: {
 *      value: // value for 'value'
 *      laneId: // value for 'laneId'
 *      isCompleted: // value for 'isCompleted'
 *      scorecard: // value for 'scorecard'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useCreateScoreMutation(baseOptions?: Apollo.MutationHookOptions<CreateScoreMutation, CreateScoreMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateScoreMutation, CreateScoreMutationVariables>(CreateScoreDocument, options);
      }
export type CreateScoreMutationHookResult = ReturnType<typeof useCreateScoreMutation>;
export type CreateScoreMutationResult = Apollo.MutationResult<CreateScoreMutation>;
export type CreateScoreMutationOptions = Apollo.BaseMutationOptions<CreateScoreMutation, CreateScoreMutationVariables>;
export const CreateTicketTypeDocument = gql`
    mutation CreateTicketType($input: TicketTypeInput!) {
  createTicketType(input: $input) {
    id
    name
  }
}
    `;
export type CreateTicketTypeMutationFn = Apollo.MutationFunction<CreateTicketTypeMutation, CreateTicketTypeMutationVariables>;

/**
 * __useCreateTicketTypeMutation__
 *
 * To run a mutation, you first call `useCreateTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createTicketTypeMutation, { data, loading, error }] = useCreateTicketTypeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<CreateTicketTypeMutation, CreateTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateTicketTypeMutation, CreateTicketTypeMutationVariables>(CreateTicketTypeDocument, options);
      }
export type CreateTicketTypeMutationHookResult = ReturnType<typeof useCreateTicketTypeMutation>;
export type CreateTicketTypeMutationResult = Apollo.MutationResult<CreateTicketTypeMutation>;
export type CreateTicketTypeMutationOptions = Apollo.BaseMutationOptions<CreateTicketTypeMutation, CreateTicketTypeMutationVariables>;
export const CreateVolunteerTicketTypeDocument = gql`
    mutation CreateVolunteerTicketType($competitionId: String!) {
  createVolunteerTicketType(competitionId: $competitionId) {
    id
    name
  }
}
    `;
export type CreateVolunteerTicketTypeMutationFn = Apollo.MutationFunction<CreateVolunteerTicketTypeMutation, CreateVolunteerTicketTypeMutationVariables>;

/**
 * __useCreateVolunteerTicketTypeMutation__
 *
 * To run a mutation, you first call `useCreateVolunteerTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateVolunteerTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createVolunteerTicketTypeMutation, { data, loading, error }] = useCreateVolunteerTicketTypeMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useCreateVolunteerTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<CreateVolunteerTicketTypeMutation, CreateVolunteerTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateVolunteerTicketTypeMutation, CreateVolunteerTicketTypeMutationVariables>(CreateVolunteerTicketTypeDocument, options);
      }
export type CreateVolunteerTicketTypeMutationHookResult = ReturnType<typeof useCreateVolunteerTicketTypeMutation>;
export type CreateVolunteerTicketTypeMutationResult = Apollo.MutationResult<CreateVolunteerTicketTypeMutation>;
export type CreateVolunteerTicketTypeMutationOptions = Apollo.BaseMutationOptions<CreateVolunteerTicketTypeMutation, CreateVolunteerTicketTypeMutationVariables>;
export const CreateWorkoutDocument = gql`
    mutation CreateWorkout($input: CreateWorkoutInput!) {
  createWorkout(input: $input) {
    id
    name
    description
    releaseDateTime
    competitionId
    location
    scoreType
    unitOfMeasurement
    timeCap
    includeStandardsVideo
    createdAt
    updatedAt
    videos {
      id
      title
      description
      url
      orderIndex
    }
  }
}
    `;
export type CreateWorkoutMutationFn = Apollo.MutationFunction<CreateWorkoutMutation, CreateWorkoutMutationVariables>;

/**
 * __useCreateWorkoutMutation__
 *
 * To run a mutation, you first call `useCreateWorkoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkoutMutation, { data, loading, error }] = useCreateWorkoutMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateWorkoutMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkoutMutation, CreateWorkoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkoutMutation, CreateWorkoutMutationVariables>(CreateWorkoutDocument, options);
      }
export type CreateWorkoutMutationHookResult = ReturnType<typeof useCreateWorkoutMutation>;
export type CreateWorkoutMutationResult = Apollo.MutationResult<CreateWorkoutMutation>;
export type CreateWorkoutMutationOptions = Apollo.BaseMutationOptions<CreateWorkoutMutation, CreateWorkoutMutationVariables>;
export const CreateWorkoutVideoDocument = gql`
    mutation CreateWorkoutVideo($workoutId: String!, $title: String!, $description: String, $url: String!, $orderIndex: Int) {
  createWorkoutVideo(
    workoutId: $workoutId
    title: $title
    description: $description
    url: $url
    orderIndex: $orderIndex
  ) {
    id
    title
    description
    url
    orderIndex
    workoutId
  }
}
    `;
export type CreateWorkoutVideoMutationFn = Apollo.MutationFunction<CreateWorkoutVideoMutation, CreateWorkoutVideoMutationVariables>;

/**
 * __useCreateWorkoutVideoMutation__
 *
 * To run a mutation, you first call `useCreateWorkoutVideoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateWorkoutVideoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createWorkoutVideoMutation, { data, loading, error }] = useCreateWorkoutVideoMutation({
 *   variables: {
 *      workoutId: // value for 'workoutId'
 *      title: // value for 'title'
 *      description: // value for 'description'
 *      url: // value for 'url'
 *      orderIndex: // value for 'orderIndex'
 *   },
 * });
 */
export function useCreateWorkoutVideoMutation(baseOptions?: Apollo.MutationHookOptions<CreateWorkoutVideoMutation, CreateWorkoutVideoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateWorkoutVideoMutation, CreateWorkoutVideoMutationVariables>(CreateWorkoutVideoDocument, options);
      }
export type CreateWorkoutVideoMutationHookResult = ReturnType<typeof useCreateWorkoutVideoMutation>;
export type CreateWorkoutVideoMutationResult = Apollo.MutationResult<CreateWorkoutVideoMutation>;
export type CreateWorkoutVideoMutationOptions = Apollo.BaseMutationOptions<CreateWorkoutVideoMutation, CreateWorkoutVideoMutationVariables>;
export const DeleteCompetitionDocument = gql`
    mutation DeleteCompetition($id: String!) {
  deleteCompetition(id: $id)
}
    `;
export type DeleteCompetitionMutationFn = Apollo.MutationFunction<DeleteCompetitionMutation, DeleteCompetitionMutationVariables>;

/**
 * __useDeleteCompetitionMutation__
 *
 * To run a mutation, you first call `useDeleteCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteCompetitionMutation, { data, loading, error }] = useDeleteCompetitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteCompetitionMutation, DeleteCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteCompetitionMutation, DeleteCompetitionMutationVariables>(DeleteCompetitionDocument, options);
      }
export type DeleteCompetitionMutationHookResult = ReturnType<typeof useDeleteCompetitionMutation>;
export type DeleteCompetitionMutationResult = Apollo.MutationResult<DeleteCompetitionMutation>;
export type DeleteCompetitionMutationOptions = Apollo.BaseMutationOptions<DeleteCompetitionMutation, DeleteCompetitionMutationVariables>;
export const DeleteDirectoryCompDocument = gql`
    mutation DeleteDirectoryComp($id: String!) {
  deleteDirectoryComp(id: $id)
}
    `;
export type DeleteDirectoryCompMutationFn = Apollo.MutationFunction<DeleteDirectoryCompMutation, DeleteDirectoryCompMutationVariables>;

/**
 * __useDeleteDirectoryCompMutation__
 *
 * To run a mutation, you first call `useDeleteDirectoryCompMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteDirectoryCompMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteDirectoryCompMutation, { data, loading, error }] = useDeleteDirectoryCompMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteDirectoryCompMutation(baseOptions?: Apollo.MutationHookOptions<DeleteDirectoryCompMutation, DeleteDirectoryCompMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteDirectoryCompMutation, DeleteDirectoryCompMutationVariables>(DeleteDirectoryCompDocument, options);
      }
export type DeleteDirectoryCompMutationHookResult = ReturnType<typeof useDeleteDirectoryCompMutation>;
export type DeleteDirectoryCompMutationResult = Apollo.MutationResult<DeleteDirectoryCompMutation>;
export type DeleteDirectoryCompMutationOptions = Apollo.BaseMutationOptions<DeleteDirectoryCompMutation, DeleteDirectoryCompMutationVariables>;
export const DeleteHeatDocument = gql`
    mutation DeleteHeat($id: String!) {
  deleteHeat(id: $id) {
    id
    startTime
    workoutId
  }
}
    `;
export type DeleteHeatMutationFn = Apollo.MutationFunction<DeleteHeatMutation, DeleteHeatMutationVariables>;

/**
 * __useDeleteHeatMutation__
 *
 * To run a mutation, you first call `useDeleteHeatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteHeatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteHeatMutation, { data, loading, error }] = useDeleteHeatMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteHeatMutation(baseOptions?: Apollo.MutationHookOptions<DeleteHeatMutation, DeleteHeatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteHeatMutation, DeleteHeatMutationVariables>(DeleteHeatDocument, options);
      }
export type DeleteHeatMutationHookResult = ReturnType<typeof useDeleteHeatMutation>;
export type DeleteHeatMutationResult = Apollo.MutationResult<DeleteHeatMutation>;
export type DeleteHeatMutationOptions = Apollo.BaseMutationOptions<DeleteHeatMutation, DeleteHeatMutationVariables>;
export const DeleteRegistrationDocument = gql`
    mutation DeleteRegistration($registrationId: ID!, $userId: ID!, $competitionId: ID!, $teamId: ID) {
  deleteRegistration(
    registrationId: $registrationId
    userId: $userId
    competitionId: $competitionId
    teamId: $teamId
  )
}
    `;
export type DeleteRegistrationMutationFn = Apollo.MutationFunction<DeleteRegistrationMutation, DeleteRegistrationMutationVariables>;

/**
 * __useDeleteRegistrationMutation__
 *
 * To run a mutation, you first call `useDeleteRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRegistrationMutation, { data, loading, error }] = useDeleteRegistrationMutation({
 *   variables: {
 *      registrationId: // value for 'registrationId'
 *      userId: // value for 'userId'
 *      competitionId: // value for 'competitionId'
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useDeleteRegistrationMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRegistrationMutation, DeleteRegistrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRegistrationMutation, DeleteRegistrationMutationVariables>(DeleteRegistrationDocument, options);
      }
export type DeleteRegistrationMutationHookResult = ReturnType<typeof useDeleteRegistrationMutation>;
export type DeleteRegistrationMutationResult = Apollo.MutationResult<DeleteRegistrationMutation>;
export type DeleteRegistrationMutationOptions = Apollo.BaseMutationOptions<DeleteRegistrationMutation, DeleteRegistrationMutationVariables>;
export const DeleteRegistrationFieldDocument = gql`
    mutation DeleteRegistrationField($registrationFieldId: String!) {
  deleteRegistrationField(registrationFieldId: $registrationFieldId)
}
    `;
export type DeleteRegistrationFieldMutationFn = Apollo.MutationFunction<DeleteRegistrationFieldMutation, DeleteRegistrationFieldMutationVariables>;

/**
 * __useDeleteRegistrationFieldMutation__
 *
 * To run a mutation, you first call `useDeleteRegistrationFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteRegistrationFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteRegistrationFieldMutation, { data, loading, error }] = useDeleteRegistrationFieldMutation({
 *   variables: {
 *      registrationFieldId: // value for 'registrationFieldId'
 *   },
 * });
 */
export function useDeleteRegistrationFieldMutation(baseOptions?: Apollo.MutationHookOptions<DeleteRegistrationFieldMutation, DeleteRegistrationFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteRegistrationFieldMutation, DeleteRegistrationFieldMutationVariables>(DeleteRegistrationFieldDocument, options);
      }
export type DeleteRegistrationFieldMutationHookResult = ReturnType<typeof useDeleteRegistrationFieldMutation>;
export type DeleteRegistrationFieldMutationResult = Apollo.MutationResult<DeleteRegistrationFieldMutation>;
export type DeleteRegistrationFieldMutationOptions = Apollo.BaseMutationOptions<DeleteRegistrationFieldMutation, DeleteRegistrationFieldMutationVariables>;
export const DeleteTeamDocument = gql`
    mutation DeleteTeam($teamId: ID!, $competitionId: ID!) {
  deleteTeam(teamId: $teamId, competitionId: $competitionId)
}
    `;
export type DeleteTeamMutationFn = Apollo.MutationFunction<DeleteTeamMutation, DeleteTeamMutationVariables>;

/**
 * __useDeleteTeamMutation__
 *
 * To run a mutation, you first call `useDeleteTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTeamMutation, { data, loading, error }] = useDeleteTeamMutation({
 *   variables: {
 *      teamId: // value for 'teamId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useDeleteTeamMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTeamMutation, DeleteTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTeamMutation, DeleteTeamMutationVariables>(DeleteTeamDocument, options);
      }
export type DeleteTeamMutationHookResult = ReturnType<typeof useDeleteTeamMutation>;
export type DeleteTeamMutationResult = Apollo.MutationResult<DeleteTeamMutation>;
export type DeleteTeamMutationOptions = Apollo.BaseMutationOptions<DeleteTeamMutation, DeleteTeamMutationVariables>;
export const DeleteTicketTypeDocument = gql`
    mutation DeleteTicketType($id: String!) {
  deleteTicketType(id: $id) {
    id
    name
    competitionId
  }
}
    `;
export type DeleteTicketTypeMutationFn = Apollo.MutationFunction<DeleteTicketTypeMutation, DeleteTicketTypeMutationVariables>;

/**
 * __useDeleteTicketTypeMutation__
 *
 * To run a mutation, you first call `useDeleteTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteTicketTypeMutation, { data, loading, error }] = useDeleteTicketTypeMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<DeleteTicketTypeMutation, DeleteTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteTicketTypeMutation, DeleteTicketTypeMutationVariables>(DeleteTicketTypeDocument, options);
      }
export type DeleteTicketTypeMutationHookResult = ReturnType<typeof useDeleteTicketTypeMutation>;
export type DeleteTicketTypeMutationResult = Apollo.MutationResult<DeleteTicketTypeMutation>;
export type DeleteTicketTypeMutationOptions = Apollo.BaseMutationOptions<DeleteTicketTypeMutation, DeleteTicketTypeMutationVariables>;
export const DeleteVolunteerTicketDocument = gql`
    mutation DeleteVolunteerTicket($competitionId: String!) {
  deleteVolunteerTicket(competitionId: $competitionId)
}
    `;
export type DeleteVolunteerTicketMutationFn = Apollo.MutationFunction<DeleteVolunteerTicketMutation, DeleteVolunteerTicketMutationVariables>;

/**
 * __useDeleteVolunteerTicketMutation__
 *
 * To run a mutation, you first call `useDeleteVolunteerTicketMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteVolunteerTicketMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteVolunteerTicketMutation, { data, loading, error }] = useDeleteVolunteerTicketMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useDeleteVolunteerTicketMutation(baseOptions?: Apollo.MutationHookOptions<DeleteVolunteerTicketMutation, DeleteVolunteerTicketMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteVolunteerTicketMutation, DeleteVolunteerTicketMutationVariables>(DeleteVolunteerTicketDocument, options);
      }
export type DeleteVolunteerTicketMutationHookResult = ReturnType<typeof useDeleteVolunteerTicketMutation>;
export type DeleteVolunteerTicketMutationResult = Apollo.MutationResult<DeleteVolunteerTicketMutation>;
export type DeleteVolunteerTicketMutationOptions = Apollo.BaseMutationOptions<DeleteVolunteerTicketMutation, DeleteVolunteerTicketMutationVariables>;
export const DeleteWorkoutDocument = gql`
    mutation DeleteWorkout($id: String!) {
  deleteWorkout(id: $id) {
    id
    name
  }
}
    `;
export type DeleteWorkoutMutationFn = Apollo.MutationFunction<DeleteWorkoutMutation, DeleteWorkoutMutationVariables>;

/**
 * __useDeleteWorkoutMutation__
 *
 * To run a mutation, you first call `useDeleteWorkoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteWorkoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteWorkoutMutation, { data, loading, error }] = useDeleteWorkoutMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteWorkoutMutation(baseOptions?: Apollo.MutationHookOptions<DeleteWorkoutMutation, DeleteWorkoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteWorkoutMutation, DeleteWorkoutMutationVariables>(DeleteWorkoutDocument, options);
      }
export type DeleteWorkoutMutationHookResult = ReturnType<typeof useDeleteWorkoutMutation>;
export type DeleteWorkoutMutationResult = Apollo.MutationResult<DeleteWorkoutMutation>;
export type DeleteWorkoutMutationOptions = Apollo.BaseMutationOptions<DeleteWorkoutMutation, DeleteWorkoutMutationVariables>;
export const DuplicateTicketTypeDocument = gql`
    mutation DuplicateTicketType($originalId: String!) {
  duplicateTicketType(originalId: $originalId) {
    id
    name
    description
    maxEntries
    price
    teamSize
    currency
    isVolunteer
    competitionId
    allowHeatSelection
    registered
    createdAt
    updatedAt
  }
}
    `;
export type DuplicateTicketTypeMutationFn = Apollo.MutationFunction<DuplicateTicketTypeMutation, DuplicateTicketTypeMutationVariables>;

/**
 * __useDuplicateTicketTypeMutation__
 *
 * To run a mutation, you first call `useDuplicateTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDuplicateTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [duplicateTicketTypeMutation, { data, loading, error }] = useDuplicateTicketTypeMutation({
 *   variables: {
 *      originalId: // value for 'originalId'
 *   },
 * });
 */
export function useDuplicateTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<DuplicateTicketTypeMutation, DuplicateTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DuplicateTicketTypeMutation, DuplicateTicketTypeMutationVariables>(DuplicateTicketTypeDocument, options);
      }
export type DuplicateTicketTypeMutationHookResult = ReturnType<typeof useDuplicateTicketTypeMutation>;
export type DuplicateTicketTypeMutationResult = Apollo.MutationResult<DuplicateTicketTypeMutation>;
export type DuplicateTicketTypeMutationOptions = Apollo.BaseMutationOptions<DuplicateTicketTypeMutation, DuplicateTicketTypeMutationVariables>;
export const ForgotPasswordDocument = gql`
    mutation ForgotPassword($email: String!) {
  forgotPassword(email: $email) {
    success
    error
  }
}
    `;
export type ForgotPasswordMutationFn = Apollo.MutationFunction<ForgotPasswordMutation, ForgotPasswordMutationVariables>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(ForgotPasswordDocument, options);
      }
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = Apollo.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = Apollo.BaseMutationOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const GenerateHeatsFromSettingsDocument = gql`
    mutation GenerateHeatsFromSettings($competitionId: String!, $input: GenerateHeatsInput!) {
  generateHeatsFromSettings(competitionId: $competitionId, input: $input) {
    id
  }
}
    `;
export type GenerateHeatsFromSettingsMutationFn = Apollo.MutationFunction<GenerateHeatsFromSettingsMutation, GenerateHeatsFromSettingsMutationVariables>;

/**
 * __useGenerateHeatsFromSettingsMutation__
 *
 * To run a mutation, you first call `useGenerateHeatsFromSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useGenerateHeatsFromSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [generateHeatsFromSettingsMutation, { data, loading, error }] = useGenerateHeatsFromSettingsMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useGenerateHeatsFromSettingsMutation(baseOptions?: Apollo.MutationHookOptions<GenerateHeatsFromSettingsMutation, GenerateHeatsFromSettingsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<GenerateHeatsFromSettingsMutation, GenerateHeatsFromSettingsMutationVariables>(GenerateHeatsFromSettingsDocument, options);
      }
export type GenerateHeatsFromSettingsMutationHookResult = ReturnType<typeof useGenerateHeatsFromSettingsMutation>;
export type GenerateHeatsFromSettingsMutationResult = Apollo.MutationResult<GenerateHeatsFromSettingsMutation>;
export type GenerateHeatsFromSettingsMutationOptions = Apollo.BaseMutationOptions<GenerateHeatsFromSettingsMutation, GenerateHeatsFromSettingsMutationVariables>;
export const GetAllDirectoryCompsDocument = gql`
    query GetAllDirectoryComps {
  getAllDirectoryComps {
    id
    title
    teamSize
    location
    country
    startDate
    endDate
    price
    currency
    website
    ticketWebsite
    ctaLink
    email
    instagramHandle
    logo
    description
    categories {
      id
      gender
      teamSize
      difficulty
      isSoldOut
      tags
    }
  }
}
    `;

/**
 * __useGetAllDirectoryCompsQuery__
 *
 * To run a query within a React component, call `useGetAllDirectoryCompsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllDirectoryCompsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllDirectoryCompsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllDirectoryCompsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllDirectoryCompsQuery, GetAllDirectoryCompsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllDirectoryCompsQuery, GetAllDirectoryCompsQueryVariables>(GetAllDirectoryCompsDocument, options);
      }
export function useGetAllDirectoryCompsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllDirectoryCompsQuery, GetAllDirectoryCompsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllDirectoryCompsQuery, GetAllDirectoryCompsQueryVariables>(GetAllDirectoryCompsDocument, options);
        }
export type GetAllDirectoryCompsQueryHookResult = ReturnType<typeof useGetAllDirectoryCompsQuery>;
export type GetAllDirectoryCompsLazyQueryHookResult = ReturnType<typeof useGetAllDirectoryCompsLazyQuery>;
export type GetAllDirectoryCompsQueryResult = Apollo.QueryResult<GetAllDirectoryCompsQuery, GetAllDirectoryCompsQueryVariables>;
export const GetAvailableHeatsByCompetitionIdDocument = gql`
    query GetAvailableHeatsByCompetitionId($competitionId: String!, $ticketTypeId: String!) {
  getAvailableHeatsByCompetitionId(
    competitionId: $competitionId
    ticketTypeId: $ticketTypeId
  ) {
    id
    startTime
    workoutId
    maxLimitPerHeat
    createdAt
    updatedAt
    ticketTypes {
      id
      name
    }
  }
}
    `;

/**
 * __useGetAvailableHeatsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetAvailableHeatsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableHeatsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableHeatsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      ticketTypeId: // value for 'ticketTypeId'
 *   },
 * });
 */
export function useGetAvailableHeatsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetAvailableHeatsByCompetitionIdQuery, GetAvailableHeatsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableHeatsByCompetitionIdQuery, GetAvailableHeatsByCompetitionIdQueryVariables>(GetAvailableHeatsByCompetitionIdDocument, options);
      }
export function useGetAvailableHeatsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableHeatsByCompetitionIdQuery, GetAvailableHeatsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableHeatsByCompetitionIdQuery, GetAvailableHeatsByCompetitionIdQueryVariables>(GetAvailableHeatsByCompetitionIdDocument, options);
        }
export type GetAvailableHeatsByCompetitionIdQueryHookResult = ReturnType<typeof useGetAvailableHeatsByCompetitionIdQuery>;
export type GetAvailableHeatsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetAvailableHeatsByCompetitionIdLazyQuery>;
export type GetAvailableHeatsByCompetitionIdQueryResult = Apollo.QueryResult<GetAvailableHeatsByCompetitionIdQuery, GetAvailableHeatsByCompetitionIdQueryVariables>;
export const GetAvailableTeamsForMoveDocument = gql`
    query GetAvailableTeamsForMove($competitionId: String!, $ticketTypeId: String!, $excludeTeamId: String) {
  getAvailableTeamsForMove(
    competitionId: $competitionId
    ticketTypeId: $ticketTypeId
    excludeTeamId: $excludeTeamId
  ) {
    id
    name
    teamCaptainId
    members {
      id
      user {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useGetAvailableTeamsForMoveQuery__
 *
 * To run a query within a React component, call `useGetAvailableTeamsForMoveQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAvailableTeamsForMoveQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAvailableTeamsForMoveQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      ticketTypeId: // value for 'ticketTypeId'
 *      excludeTeamId: // value for 'excludeTeamId'
 *   },
 * });
 */
export function useGetAvailableTeamsForMoveQuery(baseOptions: Apollo.QueryHookOptions<GetAvailableTeamsForMoveQuery, GetAvailableTeamsForMoveQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAvailableTeamsForMoveQuery, GetAvailableTeamsForMoveQueryVariables>(GetAvailableTeamsForMoveDocument, options);
      }
export function useGetAvailableTeamsForMoveLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAvailableTeamsForMoveQuery, GetAvailableTeamsForMoveQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAvailableTeamsForMoveQuery, GetAvailableTeamsForMoveQueryVariables>(GetAvailableTeamsForMoveDocument, options);
        }
export type GetAvailableTeamsForMoveQueryHookResult = ReturnType<typeof useGetAvailableTeamsForMoveQuery>;
export type GetAvailableTeamsForMoveLazyQueryHookResult = ReturnType<typeof useGetAvailableTeamsForMoveLazyQuery>;
export type GetAvailableTeamsForMoveQueryResult = Apollo.QueryResult<GetAvailableTeamsForMoveQuery, GetAvailableTeamsForMoveQueryVariables>;
export const GetCompetitionByIdDocument = gql`
    query GetCompetitionById($id: String!) {
  getCompetitionById(id: $id) {
    id
    name
    description
    startDateTime
    endDateTime
    timezone
    releaseDateTime
    hasWorkouts
    directoryCompId
    logo
    orgName
    website
    source
    registrationEnabled
    currency
    price
    createdBy {
      email
    }
    org {
      id
      name
      email
      twitter
      description
      facebook
      instagram
      youtube
      website
    }
    address {
      venue
      street
      city
      country
      postcode
      region
    }
  }
}
    `;

/**
 * __useGetCompetitionByIdQuery__
 *
 * To run a query within a React component, call `useGetCompetitionByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompetitionByIdQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionByIdQuery, GetCompetitionByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionByIdQuery, GetCompetitionByIdQueryVariables>(GetCompetitionByIdDocument, options);
      }
export function useGetCompetitionByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionByIdQuery, GetCompetitionByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionByIdQuery, GetCompetitionByIdQueryVariables>(GetCompetitionByIdDocument, options);
        }
export type GetCompetitionByIdQueryHookResult = ReturnType<typeof useGetCompetitionByIdQuery>;
export type GetCompetitionByIdLazyQueryHookResult = ReturnType<typeof useGetCompetitionByIdLazyQuery>;
export type GetCompetitionByIdQueryResult = Apollo.QueryResult<GetCompetitionByIdQuery, GetCompetitionByIdQueryVariables>;
export const GetCompetitionFiltersDocument = gql`
    query GetCompetitionFilters {
  getCompetitionFilters {
    countries
    cities
    teamSizes
  }
}
    `;

/**
 * __useGetCompetitionFiltersQuery__
 *
 * To run a query within a React component, call `useGetCompetitionFiltersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionFiltersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionFiltersQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCompetitionFiltersQuery(baseOptions?: Apollo.QueryHookOptions<GetCompetitionFiltersQuery, GetCompetitionFiltersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionFiltersQuery, GetCompetitionFiltersQueryVariables>(GetCompetitionFiltersDocument, options);
      }
export function useGetCompetitionFiltersLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionFiltersQuery, GetCompetitionFiltersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionFiltersQuery, GetCompetitionFiltersQueryVariables>(GetCompetitionFiltersDocument, options);
        }
export type GetCompetitionFiltersQueryHookResult = ReturnType<typeof useGetCompetitionFiltersQuery>;
export type GetCompetitionFiltersLazyQueryHookResult = ReturnType<typeof useGetCompetitionFiltersLazyQuery>;
export type GetCompetitionFiltersQueryResult = Apollo.QueryResult<GetCompetitionFiltersQuery, GetCompetitionFiltersQueryVariables>;
export const GetCompetitionInvitationDocument = gql`
    query GetCompetitionInvitation($token: String!) {
  getCompetitionInvitation(token: $token) {
    id
    email
    competition {
      id
      name
      startDateTime
      endDateTime
    }
    sender {
      id
      firstName
      lastName
    }
    createdAt
    status
  }
}
    `;

/**
 * __useGetCompetitionInvitationQuery__
 *
 * To run a query within a React component, call `useGetCompetitionInvitationQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionInvitationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionInvitationQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useGetCompetitionInvitationQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionInvitationQuery, GetCompetitionInvitationQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionInvitationQuery, GetCompetitionInvitationQueryVariables>(GetCompetitionInvitationDocument, options);
      }
export function useGetCompetitionInvitationLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionInvitationQuery, GetCompetitionInvitationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionInvitationQuery, GetCompetitionInvitationQueryVariables>(GetCompetitionInvitationDocument, options);
        }
export type GetCompetitionInvitationQueryHookResult = ReturnType<typeof useGetCompetitionInvitationQuery>;
export type GetCompetitionInvitationLazyQueryHookResult = ReturnType<typeof useGetCompetitionInvitationLazyQuery>;
export type GetCompetitionInvitationQueryResult = Apollo.QueryResult<GetCompetitionInvitationQuery, GetCompetitionInvitationQueryVariables>;
export const GetCompetitionNameByIdDocument = gql`
    query GetCompetitionNameById($id: String!) {
  getCompetitionById(id: $id) {
    id
    name
    startDateTime
  }
}
    `;

/**
 * __useGetCompetitionNameByIdQuery__
 *
 * To run a query within a React component, call `useGetCompetitionNameByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionNameByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionNameByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompetitionNameByIdQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionNameByIdQuery, GetCompetitionNameByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionNameByIdQuery, GetCompetitionNameByIdQueryVariables>(GetCompetitionNameByIdDocument, options);
      }
export function useGetCompetitionNameByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionNameByIdQuery, GetCompetitionNameByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionNameByIdQuery, GetCompetitionNameByIdQueryVariables>(GetCompetitionNameByIdDocument, options);
        }
export type GetCompetitionNameByIdQueryHookResult = ReturnType<typeof useGetCompetitionNameByIdQuery>;
export type GetCompetitionNameByIdLazyQueryHookResult = ReturnType<typeof useGetCompetitionNameByIdLazyQuery>;
export type GetCompetitionNameByIdQueryResult = Apollo.QueryResult<GetCompetitionNameByIdQuery, GetCompetitionNameByIdQueryVariables>;
export const GetCompetitionScheduleDocument = gql`
    query GetCompetitionSchedule($competitionId: String!) {
  getHeatsByCompetitionId(competitionId: $competitionId) {
    id
    name
    startTime
    workout {
      id
      name
    }
    lanes {
      entry {
        name
        team {
          name
          members {
            user {
              name
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetCompetitionScheduleQuery__
 *
 * To run a query within a React component, call `useGetCompetitionScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionScheduleQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetCompetitionScheduleQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionScheduleQuery, GetCompetitionScheduleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionScheduleQuery, GetCompetitionScheduleQueryVariables>(GetCompetitionScheduleDocument, options);
      }
export function useGetCompetitionScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionScheduleQuery, GetCompetitionScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionScheduleQuery, GetCompetitionScheduleQueryVariables>(GetCompetitionScheduleDocument, options);
        }
export type GetCompetitionScheduleQueryHookResult = ReturnType<typeof useGetCompetitionScheduleQuery>;
export type GetCompetitionScheduleLazyQueryHookResult = ReturnType<typeof useGetCompetitionScheduleLazyQuery>;
export type GetCompetitionScheduleQueryResult = Apollo.QueryResult<GetCompetitionScheduleQuery, GetCompetitionScheduleQueryVariables>;
export const GetCompetitionStartDateTimeDocument = gql`
    query GetCompetitionStartDateTime($id: String!) {
  getCompetitionById(id: $id) {
    startDateTime
  }
}
    `;

/**
 * __useGetCompetitionStartDateTimeQuery__
 *
 * To run a query within a React component, call `useGetCompetitionStartDateTimeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionStartDateTimeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionStartDateTimeQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCompetitionStartDateTimeQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionStartDateTimeQuery, GetCompetitionStartDateTimeQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionStartDateTimeQuery, GetCompetitionStartDateTimeQueryVariables>(GetCompetitionStartDateTimeDocument, options);
      }
export function useGetCompetitionStartDateTimeLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionStartDateTimeQuery, GetCompetitionStartDateTimeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionStartDateTimeQuery, GetCompetitionStartDateTimeQueryVariables>(GetCompetitionStartDateTimeDocument, options);
        }
export type GetCompetitionStartDateTimeQueryHookResult = ReturnType<typeof useGetCompetitionStartDateTimeQuery>;
export type GetCompetitionStartDateTimeLazyQueryHookResult = ReturnType<typeof useGetCompetitionStartDateTimeLazyQuery>;
export type GetCompetitionStartDateTimeQueryResult = Apollo.QueryResult<GetCompetitionStartDateTimeQuery, GetCompetitionStartDateTimeQueryVariables>;
export const GetCompetitionsByIdsDocument = gql`
    query GetCompetitionsByIds($ids: [String!]!) {
  getCompetitionsByIds(ids: $ids) {
    id
    name
    registrationsCount
    participantsCount
    teamsCount
    registrationTrend {
      date
      count
      cumulativeCount
    }
  }
}
    `;

/**
 * __useGetCompetitionsByIdsQuery__
 *
 * To run a query within a React component, call `useGetCompetitionsByIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompetitionsByIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompetitionsByIdsQuery({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useGetCompetitionsByIdsQuery(baseOptions: Apollo.QueryHookOptions<GetCompetitionsByIdsQuery, GetCompetitionsByIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCompetitionsByIdsQuery, GetCompetitionsByIdsQueryVariables>(GetCompetitionsByIdsDocument, options);
      }
export function useGetCompetitionsByIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCompetitionsByIdsQuery, GetCompetitionsByIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCompetitionsByIdsQuery, GetCompetitionsByIdsQueryVariables>(GetCompetitionsByIdsDocument, options);
        }
export type GetCompetitionsByIdsQueryHookResult = ReturnType<typeof useGetCompetitionsByIdsQuery>;
export type GetCompetitionsByIdsLazyQueryHookResult = ReturnType<typeof useGetCompetitionsByIdsLazyQuery>;
export type GetCompetitionsByIdsQueryResult = Apollo.QueryResult<GetCompetitionsByIdsQuery, GetCompetitionsByIdsQueryVariables>;
export const GetDirectoryCompDocument = gql`
    query GetDirectoryComp($id: String!) {
  getDirectoryComp(id: $id) {
    id
    title
    location
    country
    startDate
    endDate
    price
    currency
    website
    email
    logo
    description
    instagramHandle
    createdAt
    updatedAt
    competitionId
    competition {
      id
      startDateTime
      endDateTime
    }
    categories {
      id
      difficulty
      gender
      teamSize
      isSoldOut
      tags
    }
  }
}
    `;

/**
 * __useGetDirectoryCompQuery__
 *
 * To run a query within a React component, call `useGetDirectoryCompQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDirectoryCompQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDirectoryCompQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetDirectoryCompQuery(baseOptions: Apollo.QueryHookOptions<GetDirectoryCompQuery, GetDirectoryCompQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDirectoryCompQuery, GetDirectoryCompQueryVariables>(GetDirectoryCompDocument, options);
      }
export function useGetDirectoryCompLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDirectoryCompQuery, GetDirectoryCompQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDirectoryCompQuery, GetDirectoryCompQueryVariables>(GetDirectoryCompDocument, options);
        }
export type GetDirectoryCompQueryHookResult = ReturnType<typeof useGetDirectoryCompQuery>;
export type GetDirectoryCompLazyQueryHookResult = ReturnType<typeof useGetDirectoryCompLazyQuery>;
export type GetDirectoryCompQueryResult = Apollo.QueryResult<GetDirectoryCompQuery, GetDirectoryCompQueryVariables>;
export const GetDirectoryCompsDocument = gql`
    query GetDirectoryComps($initialLoad: Boolean!) {
  getDirectoryComps(initialLoad: $initialLoad) {
    id
    title
    teamSize
    location
    country
    startDate
    endDate
    price
    currency
    website
    ticketWebsite
    ctaLink
    email
    instagramHandle
    logo
    description
    region
    competitionId
    competition {
      id
      startDateTime
      endDateTime
    }
    categories {
      id
      gender
      teamSize
      difficulty
      isSoldOut
      tags
    }
  }
}
    `;

/**
 * __useGetDirectoryCompsQuery__
 *
 * To run a query within a React component, call `useGetDirectoryCompsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDirectoryCompsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDirectoryCompsQuery({
 *   variables: {
 *      initialLoad: // value for 'initialLoad'
 *   },
 * });
 */
export function useGetDirectoryCompsQuery(baseOptions: Apollo.QueryHookOptions<GetDirectoryCompsQuery, GetDirectoryCompsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDirectoryCompsQuery, GetDirectoryCompsQueryVariables>(GetDirectoryCompsDocument, options);
      }
export function useGetDirectoryCompsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDirectoryCompsQuery, GetDirectoryCompsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDirectoryCompsQuery, GetDirectoryCompsQueryVariables>(GetDirectoryCompsDocument, options);
        }
export type GetDirectoryCompsQueryHookResult = ReturnType<typeof useGetDirectoryCompsQuery>;
export type GetDirectoryCompsLazyQueryHookResult = ReturnType<typeof useGetDirectoryCompsLazyQuery>;
export type GetDirectoryCompsQueryResult = Apollo.QueryResult<GetDirectoryCompsQuery, GetDirectoryCompsQueryVariables>;
export const GetEarlyBirdByIdDocument = gql`
    query GetEarlyBirdById($id: String!) {
  earlyBirdById(id: $id) {
    id
    price
    limit
    startDateTime
    endDateTime
    ticketTypeId
  }
}
    `;

/**
 * __useGetEarlyBirdByIdQuery__
 *
 * To run a query within a React component, call `useGetEarlyBirdByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEarlyBirdByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEarlyBirdByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetEarlyBirdByIdQuery(baseOptions: Apollo.QueryHookOptions<GetEarlyBirdByIdQuery, GetEarlyBirdByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEarlyBirdByIdQuery, GetEarlyBirdByIdQueryVariables>(GetEarlyBirdByIdDocument, options);
      }
export function useGetEarlyBirdByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEarlyBirdByIdQuery, GetEarlyBirdByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEarlyBirdByIdQuery, GetEarlyBirdByIdQueryVariables>(GetEarlyBirdByIdDocument, options);
        }
export type GetEarlyBirdByIdQueryHookResult = ReturnType<typeof useGetEarlyBirdByIdQuery>;
export type GetEarlyBirdByIdLazyQueryHookResult = ReturnType<typeof useGetEarlyBirdByIdLazyQuery>;
export type GetEarlyBirdByIdQueryResult = Apollo.QueryResult<GetEarlyBirdByIdQuery, GetEarlyBirdByIdQueryVariables>;
export const GetEntriesByCompetitionIdDocument = gql`
    query GetEntriesByCompetitionId($competitionId: String!) {
  getEntriesByCompetitionId(competitionId: $competitionId) {
    id
    name
    team {
      members {
        user {
          name
        }
      }
    }
    ticketType {
      id
      name
      isVolunteer
    }
    scores {
      id
      value
      isCompleted
      workout {
        id
        name
        scoreType
      }
    }
  }
}
    `;

/**
 * __useGetEntriesByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetEntriesByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEntriesByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEntriesByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetEntriesByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetEntriesByCompetitionIdQuery, GetEntriesByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEntriesByCompetitionIdQuery, GetEntriesByCompetitionIdQueryVariables>(GetEntriesByCompetitionIdDocument, options);
      }
export function useGetEntriesByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEntriesByCompetitionIdQuery, GetEntriesByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEntriesByCompetitionIdQuery, GetEntriesByCompetitionIdQueryVariables>(GetEntriesByCompetitionIdDocument, options);
        }
export type GetEntriesByCompetitionIdQueryHookResult = ReturnType<typeof useGetEntriesByCompetitionIdQuery>;
export type GetEntriesByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetEntriesByCompetitionIdLazyQuery>;
export type GetEntriesByCompetitionIdQueryResult = Apollo.QueryResult<GetEntriesByCompetitionIdQuery, GetEntriesByCompetitionIdQueryVariables>;
export const GetEntriesByWorkoutIdDocument = gql`
    query GetEntriesByWorkoutId($workoutId: String!) {
  getEntriesByWorkoutId(workoutId: $workoutId) {
    id
    name
    team {
      members {
        user {
          name
        }
      }
    }
    ticketType {
      name
    }
    laneByWorkoutId(workoutId: $workoutId) {
      id
      heat {
        name
        startTime
      }
    }
    score(workoutId: $workoutId) {
      id
      value
      isCompleted
      workout {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useGetEntriesByWorkoutIdQuery__
 *
 * To run a query within a React component, call `useGetEntriesByWorkoutIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEntriesByWorkoutIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEntriesByWorkoutIdQuery({
 *   variables: {
 *      workoutId: // value for 'workoutId'
 *   },
 * });
 */
export function useGetEntriesByWorkoutIdQuery(baseOptions: Apollo.QueryHookOptions<GetEntriesByWorkoutIdQuery, GetEntriesByWorkoutIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEntriesByWorkoutIdQuery, GetEntriesByWorkoutIdQueryVariables>(GetEntriesByWorkoutIdDocument, options);
      }
export function useGetEntriesByWorkoutIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEntriesByWorkoutIdQuery, GetEntriesByWorkoutIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEntriesByWorkoutIdQuery, GetEntriesByWorkoutIdQueryVariables>(GetEntriesByWorkoutIdDocument, options);
        }
export type GetEntriesByWorkoutIdQueryHookResult = ReturnType<typeof useGetEntriesByWorkoutIdQuery>;
export type GetEntriesByWorkoutIdLazyQueryHookResult = ReturnType<typeof useGetEntriesByWorkoutIdLazyQuery>;
export type GetEntriesByWorkoutIdQueryResult = Apollo.QueryResult<GetEntriesByWorkoutIdQuery, GetEntriesByWorkoutIdQueryVariables>;
export const GetEntryByUserAndCompetitionDocument = gql`
    query GetEntryByUserAndCompetition($userId: String!, $competitionId: String!) {
  getEntryByUserAndCompetition(userId: $userId, competitionId: $competitionId) {
    id
    teamId
    ticketTypeId
    userId
    invitationToken
    team {
      id
      name
      teamCaptainId
      invitations {
        email
        status
      }
      members {
        id
        userId
        isCaptain
        user {
          firstName
          lastName
          email
        }
      }
    }
  }
}
    `;

/**
 * __useGetEntryByUserAndCompetitionQuery__
 *
 * To run a query within a React component, call `useGetEntryByUserAndCompetitionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEntryByUserAndCompetitionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEntryByUserAndCompetitionQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetEntryByUserAndCompetitionQuery(baseOptions: Apollo.QueryHookOptions<GetEntryByUserAndCompetitionQuery, GetEntryByUserAndCompetitionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEntryByUserAndCompetitionQuery, GetEntryByUserAndCompetitionQueryVariables>(GetEntryByUserAndCompetitionDocument, options);
      }
export function useGetEntryByUserAndCompetitionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEntryByUserAndCompetitionQuery, GetEntryByUserAndCompetitionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEntryByUserAndCompetitionQuery, GetEntryByUserAndCompetitionQueryVariables>(GetEntryByUserAndCompetitionDocument, options);
        }
export type GetEntryByUserAndCompetitionQueryHookResult = ReturnType<typeof useGetEntryByUserAndCompetitionQuery>;
export type GetEntryByUserAndCompetitionLazyQueryHookResult = ReturnType<typeof useGetEntryByUserAndCompetitionLazyQuery>;
export type GetEntryByUserAndCompetitionQueryResult = Apollo.QueryResult<GetEntryByUserAndCompetitionQuery, GetEntryByUserAndCompetitionQueryVariables>;
export const GetEntryNamesByHeatIdDocument = gql`
    query GetEntryNamesByHeatId($heatId: String!) {
  getLanesByHeatId(heatId: $heatId) {
    entry {
      name
    }
  }
}
    `;

/**
 * __useGetEntryNamesByHeatIdQuery__
 *
 * To run a query within a React component, call `useGetEntryNamesByHeatIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEntryNamesByHeatIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEntryNamesByHeatIdQuery({
 *   variables: {
 *      heatId: // value for 'heatId'
 *   },
 * });
 */
export function useGetEntryNamesByHeatIdQuery(baseOptions: Apollo.QueryHookOptions<GetEntryNamesByHeatIdQuery, GetEntryNamesByHeatIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEntryNamesByHeatIdQuery, GetEntryNamesByHeatIdQueryVariables>(GetEntryNamesByHeatIdDocument, options);
      }
export function useGetEntryNamesByHeatIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEntryNamesByHeatIdQuery, GetEntryNamesByHeatIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEntryNamesByHeatIdQuery, GetEntryNamesByHeatIdQueryVariables>(GetEntryNamesByHeatIdDocument, options);
        }
export type GetEntryNamesByHeatIdQueryHookResult = ReturnType<typeof useGetEntryNamesByHeatIdQuery>;
export type GetEntryNamesByHeatIdLazyQueryHookResult = ReturnType<typeof useGetEntryNamesByHeatIdLazyQuery>;
export type GetEntryNamesByHeatIdQueryResult = Apollo.QueryResult<GetEntryNamesByHeatIdQuery, GetEntryNamesByHeatIdQueryVariables>;
export const GetExploreCompetitionsDocument = gql`
    query GetExploreCompetitions($limit: Int!, $offset: Int!, $search: String, $countries: [String!], $cities: [String!], $genders: [String!], $teamSize: String, $startDate: String, $endDate: String) {
  getExploreCompetitions(
    limit: $limit
    offset: $offset
    search: $search
    countries: $countries
    cities: $cities
    genders: $genders
    teamSize: $teamSize
    startDate: $startDate
    endDate: $endDate
  ) {
    id
    name
    startDateTime
    endDateTime
    logo
    description
    location
    timezone
    currency
    price
    source
    address {
      id
      city
      country
      venue
    }
    ticketTypes {
      id
      name
      price
      currency
      isVolunteer
      teamSize
    }
  }
}
    `;

/**
 * __useGetExploreCompetitionsQuery__
 *
 * To run a query within a React component, call `useGetExploreCompetitionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExploreCompetitionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExploreCompetitionsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *      search: // value for 'search'
 *      countries: // value for 'countries'
 *      cities: // value for 'cities'
 *      genders: // value for 'genders'
 *      teamSize: // value for 'teamSize'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *   },
 * });
 */
export function useGetExploreCompetitionsQuery(baseOptions: Apollo.QueryHookOptions<GetExploreCompetitionsQuery, GetExploreCompetitionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExploreCompetitionsQuery, GetExploreCompetitionsQueryVariables>(GetExploreCompetitionsDocument, options);
      }
export function useGetExploreCompetitionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExploreCompetitionsQuery, GetExploreCompetitionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExploreCompetitionsQuery, GetExploreCompetitionsQueryVariables>(GetExploreCompetitionsDocument, options);
        }
export type GetExploreCompetitionsQueryHookResult = ReturnType<typeof useGetExploreCompetitionsQuery>;
export type GetExploreCompetitionsLazyQueryHookResult = ReturnType<typeof useGetExploreCompetitionsLazyQuery>;
export type GetExploreCompetitionsQueryResult = Apollo.QueryResult<GetExploreCompetitionsQuery, GetExploreCompetitionsQueryVariables>;
export const GetHeatByIdDocument = gql`
    query GetHeatById($id: String!) {
  getHeatById(id: $id) {
    id
    availableLanes
    maxLimitPerHeat
    ticketTypes {
      id
      name
    }
    allTicketTypes {
      id
      name
    }
    workout {
      unitOfMeasurement
    }
  }
}
    `;

/**
 * __useGetHeatByIdQuery__
 *
 * To run a query within a React component, call `useGetHeatByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeatByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeatByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetHeatByIdQuery(baseOptions: Apollo.QueryHookOptions<GetHeatByIdQuery, GetHeatByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHeatByIdQuery, GetHeatByIdQueryVariables>(GetHeatByIdDocument, options);
      }
export function useGetHeatByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHeatByIdQuery, GetHeatByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHeatByIdQuery, GetHeatByIdQueryVariables>(GetHeatByIdDocument, options);
        }
export type GetHeatByIdQueryHookResult = ReturnType<typeof useGetHeatByIdQuery>;
export type GetHeatByIdLazyQueryHookResult = ReturnType<typeof useGetHeatByIdLazyQuery>;
export type GetHeatByIdQueryResult = Apollo.QueryResult<GetHeatByIdQuery, GetHeatByIdQueryVariables>;
export const GetHeatByIdTicketSelectorDocument = gql`
    query GetHeatByIdTicketSelector($id: String!) {
  getHeatById(id: $id) {
    id
    ticketTypes {
      id
      name
    }
    allTicketTypes {
      id
      name
    }
  }
}
    `;

/**
 * __useGetHeatByIdTicketSelectorQuery__
 *
 * To run a query within a React component, call `useGetHeatByIdTicketSelectorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeatByIdTicketSelectorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeatByIdTicketSelectorQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetHeatByIdTicketSelectorQuery(baseOptions: Apollo.QueryHookOptions<GetHeatByIdTicketSelectorQuery, GetHeatByIdTicketSelectorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHeatByIdTicketSelectorQuery, GetHeatByIdTicketSelectorQueryVariables>(GetHeatByIdTicketSelectorDocument, options);
      }
export function useGetHeatByIdTicketSelectorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHeatByIdTicketSelectorQuery, GetHeatByIdTicketSelectorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHeatByIdTicketSelectorQuery, GetHeatByIdTicketSelectorQueryVariables>(GetHeatByIdTicketSelectorDocument, options);
        }
export type GetHeatByIdTicketSelectorQueryHookResult = ReturnType<typeof useGetHeatByIdTicketSelectorQuery>;
export type GetHeatByIdTicketSelectorLazyQueryHookResult = ReturnType<typeof useGetHeatByIdTicketSelectorLazyQuery>;
export type GetHeatByIdTicketSelectorQueryResult = Apollo.QueryResult<GetHeatByIdTicketSelectorQuery, GetHeatByIdTicketSelectorQueryVariables>;
export const GetHeatsByCompetitionIdDocument = gql`
    query GetHeatsByCompetitionId($competitionId: String!) {
  getHeatsByCompetitionId(competitionId: $competitionId) {
    id
    startTime
    workoutId
    name
    registrationsCount
    maxLimitPerHeat
  }
}
    `;

/**
 * __useGetHeatsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetHeatsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeatsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeatsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetHeatsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetHeatsByCompetitionIdQuery, GetHeatsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHeatsByCompetitionIdQuery, GetHeatsByCompetitionIdQueryVariables>(GetHeatsByCompetitionIdDocument, options);
      }
export function useGetHeatsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHeatsByCompetitionIdQuery, GetHeatsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHeatsByCompetitionIdQuery, GetHeatsByCompetitionIdQueryVariables>(GetHeatsByCompetitionIdDocument, options);
        }
export type GetHeatsByCompetitionIdQueryHookResult = ReturnType<typeof useGetHeatsByCompetitionIdQuery>;
export type GetHeatsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetHeatsByCompetitionIdLazyQuery>;
export type GetHeatsByCompetitionIdQueryResult = Apollo.QueryResult<GetHeatsByCompetitionIdQuery, GetHeatsByCompetitionIdQueryVariables>;
export const GetHeatsByWorkoutIdDocument = gql`
    query GetHeatsByWorkoutId($workoutId: String!) {
  getHeatsByWorkoutId(workoutId: $workoutId) {
    id
    startTime
    workoutId
    name
    registrationsCount
    maxLimitPerHeat
    heatLimitType
    lanes {
      id
      number
    }
  }
}
    `;

/**
 * __useGetHeatsByWorkoutIdQuery__
 *
 * To run a query within a React component, call `useGetHeatsByWorkoutIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHeatsByWorkoutIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHeatsByWorkoutIdQuery({
 *   variables: {
 *      workoutId: // value for 'workoutId'
 *   },
 * });
 */
export function useGetHeatsByWorkoutIdQuery(baseOptions: Apollo.QueryHookOptions<GetHeatsByWorkoutIdQuery, GetHeatsByWorkoutIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHeatsByWorkoutIdQuery, GetHeatsByWorkoutIdQueryVariables>(GetHeatsByWorkoutIdDocument, options);
      }
export function useGetHeatsByWorkoutIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHeatsByWorkoutIdQuery, GetHeatsByWorkoutIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHeatsByWorkoutIdQuery, GetHeatsByWorkoutIdQueryVariables>(GetHeatsByWorkoutIdDocument, options);
        }
export type GetHeatsByWorkoutIdQueryHookResult = ReturnType<typeof useGetHeatsByWorkoutIdQuery>;
export type GetHeatsByWorkoutIdLazyQueryHookResult = ReturnType<typeof useGetHeatsByWorkoutIdLazyQuery>;
export type GetHeatsByWorkoutIdQueryResult = Apollo.QueryResult<GetHeatsByWorkoutIdQuery, GetHeatsByWorkoutIdQueryVariables>;
export const GetInvitationsByTeamIdDocument = gql`
    query GetInvitationsByTeamId($teamId: String!) {
  getInvitationsByTeamId(teamId: $teamId) {
    id
    email
    status
    createdAt
    sentBy {
      id
      name
    }
  }
}
    `;

/**
 * __useGetInvitationsByTeamIdQuery__
 *
 * To run a query within a React component, call `useGetInvitationsByTeamIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationsByTeamIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationsByTeamIdQuery({
 *   variables: {
 *      teamId: // value for 'teamId'
 *   },
 * });
 */
export function useGetInvitationsByTeamIdQuery(baseOptions: Apollo.QueryHookOptions<GetInvitationsByTeamIdQuery, GetInvitationsByTeamIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInvitationsByTeamIdQuery, GetInvitationsByTeamIdQueryVariables>(GetInvitationsByTeamIdDocument, options);
      }
export function useGetInvitationsByTeamIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInvitationsByTeamIdQuery, GetInvitationsByTeamIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInvitationsByTeamIdQuery, GetInvitationsByTeamIdQueryVariables>(GetInvitationsByTeamIdDocument, options);
        }
export type GetInvitationsByTeamIdQueryHookResult = ReturnType<typeof useGetInvitationsByTeamIdQuery>;
export type GetInvitationsByTeamIdLazyQueryHookResult = ReturnType<typeof useGetInvitationsByTeamIdLazyQuery>;
export type GetInvitationsByTeamIdQueryResult = Apollo.QueryResult<GetInvitationsByTeamIdQuery, GetInvitationsByTeamIdQueryVariables>;
export const GetInvitationByTokenDocument = gql`
    query GetInvitationByToken($token: String!) {
  getInvitationByToken(token: $token) {
    id
    teamId
    token
    email
    status
    team {
      id
      name
      teamCaptain {
        name
      }
    }
  }
}
    `;

/**
 * __useGetInvitationByTokenQuery__
 *
 * To run a query within a React component, call `useGetInvitationByTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetInvitationByTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetInvitationByTokenQuery({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useGetInvitationByTokenQuery(baseOptions: Apollo.QueryHookOptions<GetInvitationByTokenQuery, GetInvitationByTokenQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetInvitationByTokenQuery, GetInvitationByTokenQueryVariables>(GetInvitationByTokenDocument, options);
      }
export function useGetInvitationByTokenLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetInvitationByTokenQuery, GetInvitationByTokenQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetInvitationByTokenQuery, GetInvitationByTokenQueryVariables>(GetInvitationByTokenDocument, options);
        }
export type GetInvitationByTokenQueryHookResult = ReturnType<typeof useGetInvitationByTokenQuery>;
export type GetInvitationByTokenLazyQueryHookResult = ReturnType<typeof useGetInvitationByTokenLazyQuery>;
export type GetInvitationByTokenQueryResult = Apollo.QueryResult<GetInvitationByTokenQuery, GetInvitationByTokenQueryVariables>;
export const GetLaneByIdDocument = gql`
    query GetLaneById($id: String!) {
  getLaneById(id: $id) {
    id
    score {
      id
      value
      scorecard
      note
    }
  }
}
    `;

/**
 * __useGetLaneByIdQuery__
 *
 * To run a query within a React component, call `useGetLaneByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLaneByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLaneByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetLaneByIdQuery(baseOptions: Apollo.QueryHookOptions<GetLaneByIdQuery, GetLaneByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLaneByIdQuery, GetLaneByIdQueryVariables>(GetLaneByIdDocument, options);
      }
export function useGetLaneByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLaneByIdQuery, GetLaneByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLaneByIdQuery, GetLaneByIdQueryVariables>(GetLaneByIdDocument, options);
        }
export type GetLaneByIdQueryHookResult = ReturnType<typeof useGetLaneByIdQuery>;
export type GetLaneByIdLazyQueryHookResult = ReturnType<typeof useGetLaneByIdLazyQuery>;
export type GetLaneByIdQueryResult = Apollo.QueryResult<GetLaneByIdQuery, GetLaneByIdQueryVariables>;
export const GetLanesByHeatIdDocument = gql`
    query GetLanesByHeatId($heatId: String!) {
  getLanesByHeatId(heatId: $heatId) {
    id
    number
    score {
      value
    }
    entry {
      name
      team {
        members {
          user {
            name
          }
        }
      }
      ticketType {
        id
        name
      }
    }
  }
}
    `;

/**
 * __useGetLanesByHeatIdQuery__
 *
 * To run a query within a React component, call `useGetLanesByHeatIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanesByHeatIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLanesByHeatIdQuery({
 *   variables: {
 *      heatId: // value for 'heatId'
 *   },
 * });
 */
export function useGetLanesByHeatIdQuery(baseOptions: Apollo.QueryHookOptions<GetLanesByHeatIdQuery, GetLanesByHeatIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetLanesByHeatIdQuery, GetLanesByHeatIdQueryVariables>(GetLanesByHeatIdDocument, options);
      }
export function useGetLanesByHeatIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetLanesByHeatIdQuery, GetLanesByHeatIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetLanesByHeatIdQuery, GetLanesByHeatIdQueryVariables>(GetLanesByHeatIdDocument, options);
        }
export type GetLanesByHeatIdQueryHookResult = ReturnType<typeof useGetLanesByHeatIdQuery>;
export type GetLanesByHeatIdLazyQueryHookResult = ReturnType<typeof useGetLanesByHeatIdLazyQuery>;
export type GetLanesByHeatIdQueryResult = Apollo.QueryResult<GetLanesByHeatIdQuery, GetLanesByHeatIdQueryVariables>;
export const GetMaxEntriesDocument = gql`
    query GetMaxEntries($competitionId: String!) {
  getScoreSettingByCompetitionId(competitionId: $competitionId) {
    id
    heatLimitType
    maxLimitPerHeat
  }
}
    `;

/**
 * __useGetMaxEntriesQuery__
 *
 * To run a query within a React component, call `useGetMaxEntriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaxEntriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaxEntriesQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetMaxEntriesQuery(baseOptions: Apollo.QueryHookOptions<GetMaxEntriesQuery, GetMaxEntriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaxEntriesQuery, GetMaxEntriesQueryVariables>(GetMaxEntriesDocument, options);
      }
export function useGetMaxEntriesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaxEntriesQuery, GetMaxEntriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaxEntriesQuery, GetMaxEntriesQueryVariables>(GetMaxEntriesDocument, options);
        }
export type GetMaxEntriesQueryHookResult = ReturnType<typeof useGetMaxEntriesQuery>;
export type GetMaxEntriesLazyQueryHookResult = ReturnType<typeof useGetMaxEntriesLazyQuery>;
export type GetMaxEntriesQueryResult = Apollo.QueryResult<GetMaxEntriesQuery, GetMaxEntriesQueryVariables>;
export const GetMaxLimitPerHeatDocument = gql`
    query GetMaxLimitPerHeat($competitionId: String!) {
  getScoreSettingByCompetitionId(competitionId: $competitionId) {
    maxLimitPerHeat
  }
}
    `;

/**
 * __useGetMaxLimitPerHeatQuery__
 *
 * To run a query within a React component, call `useGetMaxLimitPerHeatQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMaxLimitPerHeatQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMaxLimitPerHeatQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetMaxLimitPerHeatQuery(baseOptions: Apollo.QueryHookOptions<GetMaxLimitPerHeatQuery, GetMaxLimitPerHeatQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMaxLimitPerHeatQuery, GetMaxLimitPerHeatQueryVariables>(GetMaxLimitPerHeatDocument, options);
      }
export function useGetMaxLimitPerHeatLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMaxLimitPerHeatQuery, GetMaxLimitPerHeatQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMaxLimitPerHeatQuery, GetMaxLimitPerHeatQueryVariables>(GetMaxLimitPerHeatDocument, options);
        }
export type GetMaxLimitPerHeatQueryHookResult = ReturnType<typeof useGetMaxLimitPerHeatQuery>;
export type GetMaxLimitPerHeatLazyQueryHookResult = ReturnType<typeof useGetMaxLimitPerHeatLazyQuery>;
export type GetMaxLimitPerHeatQueryResult = Apollo.QueryResult<GetMaxLimitPerHeatQuery, GetMaxLimitPerHeatQueryVariables>;
export const GetMyCompetitionsAsAthleteDocument = gql`
    query GetMyCompetitionsAsAthlete {
  getMyCompetitionsAsAthlete {
    id
    name
  }
}
    `;

/**
 * __useGetMyCompetitionsAsAthleteQuery__
 *
 * To run a query within a React component, call `useGetMyCompetitionsAsAthleteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyCompetitionsAsAthleteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyCompetitionsAsAthleteQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetMyCompetitionsAsAthleteQuery(baseOptions?: Apollo.QueryHookOptions<GetMyCompetitionsAsAthleteQuery, GetMyCompetitionsAsAthleteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMyCompetitionsAsAthleteQuery, GetMyCompetitionsAsAthleteQueryVariables>(GetMyCompetitionsAsAthleteDocument, options);
      }
export function useGetMyCompetitionsAsAthleteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMyCompetitionsAsAthleteQuery, GetMyCompetitionsAsAthleteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMyCompetitionsAsAthleteQuery, GetMyCompetitionsAsAthleteQueryVariables>(GetMyCompetitionsAsAthleteDocument, options);
        }
export type GetMyCompetitionsAsAthleteQueryHookResult = ReturnType<typeof useGetMyCompetitionsAsAthleteQuery>;
export type GetMyCompetitionsAsAthleteLazyQueryHookResult = ReturnType<typeof useGetMyCompetitionsAsAthleteLazyQuery>;
export type GetMyCompetitionsAsAthleteQueryResult = Apollo.QueryResult<GetMyCompetitionsAsAthleteQuery, GetMyCompetitionsAsAthleteQueryVariables>;
export const GetNotificationSubscriptionDocument = gql`
    query GetNotificationSubscription($email: String!) {
  getNotificationSubscription(email: $email) {
    id
    email
    eventType
    countries
    locations
    tags
    gender
    difficulty
    teamSize
  }
}
    `;

/**
 * __useGetNotificationSubscriptionQuery__
 *
 * To run a query within a React component, call `useGetNotificationSubscriptionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNotificationSubscriptionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNotificationSubscriptionQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetNotificationSubscriptionQuery(baseOptions: Apollo.QueryHookOptions<GetNotificationSubscriptionQuery, GetNotificationSubscriptionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNotificationSubscriptionQuery, GetNotificationSubscriptionQueryVariables>(GetNotificationSubscriptionDocument, options);
      }
export function useGetNotificationSubscriptionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNotificationSubscriptionQuery, GetNotificationSubscriptionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNotificationSubscriptionQuery, GetNotificationSubscriptionQueryVariables>(GetNotificationSubscriptionDocument, options);
        }
export type GetNotificationSubscriptionQueryHookResult = ReturnType<typeof useGetNotificationSubscriptionQuery>;
export type GetNotificationSubscriptionLazyQueryHookResult = ReturnType<typeof useGetNotificationSubscriptionLazyQuery>;
export type GetNotificationSubscriptionQueryResult = Apollo.QueryResult<GetNotificationSubscriptionQuery, GetNotificationSubscriptionQueryVariables>;
export const GetPartnerInterestsDocument = gql`
    query GetPartnerInterests($status: String, $interestType: String, $directoryCompId: String, $competitionId: String) {
  getPartnerInterests(
    status: $status
    interestType: $interestType
    directoryCompId: $directoryCompId
    competitionId: $competitionId
  ) {
    id
    userId
    interestType
    partnerPreference
    categoryId
    description
    phone
    instagram
    status
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
      picture
      bio
    }
    category {
      id
      difficulty
      gender
      teamSize
      directoryComp {
        id
        title
      }
    }
    ticketType {
      id
      name
      teamSize
      competition {
        id
        name
      }
    }
    teamMembers {
      id
      name
      email
      userId
      status
      user {
        id
        firstName
        lastName
        picture
      }
    }
    partnerRequests {
      id
      status
      fromUser {
        id
        firstName
        lastName
        picture
      }
      fromInterest {
        id
        user {
          id
          firstName
          lastName
          picture
        }
      }
    }
  }
}
    `;

/**
 * __useGetPartnerInterestsQuery__
 *
 * To run a query within a React component, call `useGetPartnerInterestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPartnerInterestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPartnerInterestsQuery({
 *   variables: {
 *      status: // value for 'status'
 *      interestType: // value for 'interestType'
 *      directoryCompId: // value for 'directoryCompId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetPartnerInterestsQuery(baseOptions?: Apollo.QueryHookOptions<GetPartnerInterestsQuery, GetPartnerInterestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPartnerInterestsQuery, GetPartnerInterestsQueryVariables>(GetPartnerInterestsDocument, options);
      }
export function useGetPartnerInterestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPartnerInterestsQuery, GetPartnerInterestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPartnerInterestsQuery, GetPartnerInterestsQueryVariables>(GetPartnerInterestsDocument, options);
        }
export type GetPartnerInterestsQueryHookResult = ReturnType<typeof useGetPartnerInterestsQuery>;
export type GetPartnerInterestsLazyQueryHookResult = ReturnType<typeof useGetPartnerInterestsLazyQuery>;
export type GetPartnerInterestsQueryResult = Apollo.QueryResult<GetPartnerInterestsQuery, GetPartnerInterestsQueryVariables>;
export const GetPartnerRequestsDocument = gql`
    query GetPartnerRequests {
  getPartnerRequests {
    id
    fromInterestId
    fromUserId
    toInterestId
    message
    phone
    status
    createdAt
    updatedAt
    fromUser {
      id
      firstName
      lastName
      picture
      email
    }
    fromInterest {
      id
      userId
      status
      user {
        id
        firstName
        lastName
        picture
        email
      }
      category {
        id
        difficulty
        gender
        teamSize
        directoryComp {
          id
          title
        }
      }
      ticketType {
        id
        name
        teamSize
        competition {
          id
          name
        }
      }
      teamMembers {
        id
        name
        email
        userId
        status
        user {
          id
          firstName
          lastName
          picture
        }
      }
    }
    toInterest {
      id
      userId
      status
      user {
        id
        firstName
        lastName
        picture
        email
      }
      category {
        id
        difficulty
        gender
        teamSize
        directoryComp {
          id
          title
        }
      }
      ticketType {
        id
        name
        teamSize
        competition {
          id
          name
        }
      }
      teamMembers {
        id
        name
        email
        userId
        status
        user {
          id
          firstName
          lastName
          picture
        }
      }
    }
  }
}
    `;

/**
 * __useGetPartnerRequestsQuery__
 *
 * To run a query within a React component, call `useGetPartnerRequestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPartnerRequestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPartnerRequestsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPartnerRequestsQuery(baseOptions?: Apollo.QueryHookOptions<GetPartnerRequestsQuery, GetPartnerRequestsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPartnerRequestsQuery, GetPartnerRequestsQueryVariables>(GetPartnerRequestsDocument, options);
      }
export function useGetPartnerRequestsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPartnerRequestsQuery, GetPartnerRequestsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPartnerRequestsQuery, GetPartnerRequestsQueryVariables>(GetPartnerRequestsDocument, options);
        }
export type GetPartnerRequestsQueryHookResult = ReturnType<typeof useGetPartnerRequestsQuery>;
export type GetPartnerRequestsLazyQueryHookResult = ReturnType<typeof useGetPartnerRequestsLazyQuery>;
export type GetPartnerRequestsQueryResult = Apollo.QueryResult<GetPartnerRequestsQuery, GetPartnerRequestsQueryVariables>;
export const GetPaymentMappingsDocument = gql`
    query GetPaymentMappings($emails: String, $days: String) {
  getPaymentMappings(emails: $emails, days: $days) {
    email
    transactionId
    amount
    currency
    date
    competition {
      id
      name
      orgName
    }
    ticketType {
      id
      name
    }
  }
}
    `;

/**
 * __useGetPaymentMappingsQuery__
 *
 * To run a query within a React component, call `useGetPaymentMappingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPaymentMappingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPaymentMappingsQuery({
 *   variables: {
 *      emails: // value for 'emails'
 *      days: // value for 'days'
 *   },
 * });
 */
export function useGetPaymentMappingsQuery(baseOptions?: Apollo.QueryHookOptions<GetPaymentMappingsQuery, GetPaymentMappingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPaymentMappingsQuery, GetPaymentMappingsQueryVariables>(GetPaymentMappingsDocument, options);
      }
export function useGetPaymentMappingsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPaymentMappingsQuery, GetPaymentMappingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPaymentMappingsQuery, GetPaymentMappingsQueryVariables>(GetPaymentMappingsDocument, options);
        }
export type GetPaymentMappingsQueryHookResult = ReturnType<typeof useGetPaymentMappingsQuery>;
export type GetPaymentMappingsLazyQueryHookResult = ReturnType<typeof useGetPaymentMappingsLazyQuery>;
export type GetPaymentMappingsQueryResult = Apollo.QueryResult<GetPaymentMappingsQuery, GetPaymentMappingsQueryVariables>;
export const GetPotentialCompetitionsDocument = gql`
    query GetPotentialCompetitions {
  getPotentialCompetitions {
    id
    name
    description
    startDateTime
    endDateTime
    addressId
    timezone
    logo
    website
    email
    instagramHandle
    currency
    price
    source
    country
    state
    region
    orgName
    scrapedData
    status
    reviewedBy
    reviewedAt
    createdAt
    updatedAt
    address {
      id
      venue
      city
      country
    }
    potentialTicketTypes {
      id
      name
      description
      price
      currency
      maxEntries
      teamSize
      isVolunteer
      allowHeatSelection
      passOnPlatformFee
    }
    reviewer {
      id
      firstName
      lastName
      email
    }
  }
}
    `;

/**
 * __useGetPotentialCompetitionsQuery__
 *
 * To run a query within a React component, call `useGetPotentialCompetitionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPotentialCompetitionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPotentialCompetitionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetPotentialCompetitionsQuery(baseOptions?: Apollo.QueryHookOptions<GetPotentialCompetitionsQuery, GetPotentialCompetitionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPotentialCompetitionsQuery, GetPotentialCompetitionsQueryVariables>(GetPotentialCompetitionsDocument, options);
      }
export function useGetPotentialCompetitionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPotentialCompetitionsQuery, GetPotentialCompetitionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPotentialCompetitionsQuery, GetPotentialCompetitionsQueryVariables>(GetPotentialCompetitionsDocument, options);
        }
export type GetPotentialCompetitionsQueryHookResult = ReturnType<typeof useGetPotentialCompetitionsQuery>;
export type GetPotentialCompetitionsLazyQueryHookResult = ReturnType<typeof useGetPotentialCompetitionsLazyQuery>;
export type GetPotentialCompetitionsQueryResult = Apollo.QueryResult<GetPotentialCompetitionsQuery, GetPotentialCompetitionsQueryVariables>;
export const GetUserWithReferralsDocument = gql`
    query GetUserWithReferrals {
  getUser {
    id
    firstName
    lastName
    email
  }
}
    `;

/**
 * __useGetUserWithReferralsQuery__
 *
 * To run a query within a React component, call `useGetUserWithReferralsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserWithReferralsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserWithReferralsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUserWithReferralsQuery(baseOptions?: Apollo.QueryHookOptions<GetUserWithReferralsQuery, GetUserWithReferralsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserWithReferralsQuery, GetUserWithReferralsQueryVariables>(GetUserWithReferralsDocument, options);
      }
export function useGetUserWithReferralsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserWithReferralsQuery, GetUserWithReferralsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserWithReferralsQuery, GetUserWithReferralsQueryVariables>(GetUserWithReferralsDocument, options);
        }
export type GetUserWithReferralsQueryHookResult = ReturnType<typeof useGetUserWithReferralsQuery>;
export type GetUserWithReferralsLazyQueryHookResult = ReturnType<typeof useGetUserWithReferralsLazyQuery>;
export type GetUserWithReferralsQueryResult = Apollo.QueryResult<GetUserWithReferralsQuery, GetUserWithReferralsQueryVariables>;
export const GetRegistrationAnswersByCompetitionIdDocument = gql`
    query GetRegistrationAnswersByCompetitionId($competitionId: String!) {
  getRegistrationsByCompetitionId(competitionId: $competitionId) {
    registrationAnswers {
      answer
      registrationField {
        question
      }
    }
  }
}
    `;

/**
 * __useGetRegistrationAnswersByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetRegistrationAnswersByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationAnswersByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationAnswersByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetRegistrationAnswersByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationAnswersByCompetitionIdQuery, GetRegistrationAnswersByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationAnswersByCompetitionIdQuery, GetRegistrationAnswersByCompetitionIdQueryVariables>(GetRegistrationAnswersByCompetitionIdDocument, options);
      }
export function useGetRegistrationAnswersByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationAnswersByCompetitionIdQuery, GetRegistrationAnswersByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationAnswersByCompetitionIdQuery, GetRegistrationAnswersByCompetitionIdQueryVariables>(GetRegistrationAnswersByCompetitionIdDocument, options);
        }
export type GetRegistrationAnswersByCompetitionIdQueryHookResult = ReturnType<typeof useGetRegistrationAnswersByCompetitionIdQuery>;
export type GetRegistrationAnswersByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetRegistrationAnswersByCompetitionIdLazyQuery>;
export type GetRegistrationAnswersByCompetitionIdQueryResult = Apollo.QueryResult<GetRegistrationAnswersByCompetitionIdQuery, GetRegistrationAnswersByCompetitionIdQueryVariables>;
export const GetRegistrationByIdDocument = gql`
    query GetRegistrationById($id: String!) {
  getRegistrantById(id: $id) {
    id
    user {
      id
      firstName
      lastName
      name
      email
    }
    team {
      id
      name
      members {
        id
        user {
          id
          name
          email
        }
      }
    }
    registrationAnswers {
      id
      registrationField {
        id
        type
        question
        options
      }
      answer
    }
    ticketType {
      id
      name
      teamSize
    }
    createdAt
    teamName
  }
}
    `;

/**
 * __useGetRegistrationByIdQuery__
 *
 * To run a query within a React component, call `useGetRegistrationByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetRegistrationByIdQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationByIdQuery, GetRegistrationByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationByIdQuery, GetRegistrationByIdQueryVariables>(GetRegistrationByIdDocument, options);
      }
export function useGetRegistrationByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationByIdQuery, GetRegistrationByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationByIdQuery, GetRegistrationByIdQueryVariables>(GetRegistrationByIdDocument, options);
        }
export type GetRegistrationByIdQueryHookResult = ReturnType<typeof useGetRegistrationByIdQuery>;
export type GetRegistrationByIdLazyQueryHookResult = ReturnType<typeof useGetRegistrationByIdLazyQuery>;
export type GetRegistrationByIdQueryResult = Apollo.QueryResult<GetRegistrationByIdQuery, GetRegistrationByIdQueryVariables>;
export const GetRegistrationEmailsByCompetitionIdDocument = gql`
    query GetRegistrationEmailsByCompetitionId($competitionId: String!) {
  getRegistrationsByCompetitionId(competitionId: $competitionId) {
    id
    user {
      email
    }
  }
}
    `;

/**
 * __useGetRegistrationEmailsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetRegistrationEmailsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationEmailsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationEmailsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetRegistrationEmailsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationEmailsByCompetitionIdQuery, GetRegistrationEmailsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationEmailsByCompetitionIdQuery, GetRegistrationEmailsByCompetitionIdQueryVariables>(GetRegistrationEmailsByCompetitionIdDocument, options);
      }
export function useGetRegistrationEmailsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationEmailsByCompetitionIdQuery, GetRegistrationEmailsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationEmailsByCompetitionIdQuery, GetRegistrationEmailsByCompetitionIdQueryVariables>(GetRegistrationEmailsByCompetitionIdDocument, options);
        }
export type GetRegistrationEmailsByCompetitionIdQueryHookResult = ReturnType<typeof useGetRegistrationEmailsByCompetitionIdQuery>;
export type GetRegistrationEmailsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetRegistrationEmailsByCompetitionIdLazyQuery>;
export type GetRegistrationEmailsByCompetitionIdQueryResult = Apollo.QueryResult<GetRegistrationEmailsByCompetitionIdQuery, GetRegistrationEmailsByCompetitionIdQueryVariables>;
export const GetRegistrationFieldsByCompetitionIdDocument = gql`
    query GetRegistrationFieldsByCompetitionId($competitionId: String!, $isVolunteer: Boolean) {
  getRegistrationFieldsByCompetitionId(
    competitionId: $competitionId
    isVolunteer: $isVolunteer
  ) {
    id
    question
    repeatPerAthlete
    isEditable
    type
    requiredStatus
    options
    onlyTeams
    ticketTypes {
      id
      name
      isVolunteer
    }
  }
}
    `;

/**
 * __useGetRegistrationFieldsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetRegistrationFieldsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationFieldsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationFieldsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      isVolunteer: // value for 'isVolunteer'
 *   },
 * });
 */
export function useGetRegistrationFieldsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationFieldsByCompetitionIdQuery, GetRegistrationFieldsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationFieldsByCompetitionIdQuery, GetRegistrationFieldsByCompetitionIdQueryVariables>(GetRegistrationFieldsByCompetitionIdDocument, options);
      }
export function useGetRegistrationFieldsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationFieldsByCompetitionIdQuery, GetRegistrationFieldsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationFieldsByCompetitionIdQuery, GetRegistrationFieldsByCompetitionIdQueryVariables>(GetRegistrationFieldsByCompetitionIdDocument, options);
        }
export type GetRegistrationFieldsByCompetitionIdQueryHookResult = ReturnType<typeof useGetRegistrationFieldsByCompetitionIdQuery>;
export type GetRegistrationFieldsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetRegistrationFieldsByCompetitionIdLazyQuery>;
export type GetRegistrationFieldsByCompetitionIdQueryResult = Apollo.QueryResult<GetRegistrationFieldsByCompetitionIdQuery, GetRegistrationFieldsByCompetitionIdQueryVariables>;
export const GetRegistrationStatsDocument = gql`
    query GetRegistrationStats($days: String) {
  getRegistrationStats(days: $days) {
    totalRegistrations
    periodStart
    periodEnd
    competitions {
      registrationsInPeriod
      competition {
        id
        name
        startDateTime
        registrationsCount
        participantsCount
        orgName
      }
    }
  }
}
    `;

/**
 * __useGetRegistrationStatsQuery__
 *
 * To run a query within a React component, call `useGetRegistrationStatsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationStatsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationStatsQuery({
 *   variables: {
 *      days: // value for 'days'
 *   },
 * });
 */
export function useGetRegistrationStatsQuery(baseOptions?: Apollo.QueryHookOptions<GetRegistrationStatsQuery, GetRegistrationStatsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationStatsQuery, GetRegistrationStatsQueryVariables>(GetRegistrationStatsDocument, options);
      }
export function useGetRegistrationStatsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationStatsQuery, GetRegistrationStatsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationStatsQuery, GetRegistrationStatsQueryVariables>(GetRegistrationStatsDocument, options);
        }
export type GetRegistrationStatsQueryHookResult = ReturnType<typeof useGetRegistrationStatsQuery>;
export type GetRegistrationStatsLazyQueryHookResult = ReturnType<typeof useGetRegistrationStatsLazyQuery>;
export type GetRegistrationStatsQueryResult = Apollo.QueryResult<GetRegistrationStatsQuery, GetRegistrationStatsQueryVariables>;
export const GetRegistrationsByCompetitionIdDocument = gql`
    query GetRegistrationsByCompetitionId($competitionId: String!) {
  getRegistrationsByCompetitionId(competitionId: $competitionId) {
    id
    isCheckedIn
    user {
      id
      firstName
      lastName
      name
      email
    }
    registrationFields {
      id
      question
      repeatPerAthlete
      isEditable
      requiredStatus
    }
    team {
      id
      name
      members {
        id
        user {
          id
          name
          email
        }
      }
    }
    ticketType {
      id
      name
      isVolunteer
      teamSize
    }
    createdAt
    teamName
  }
}
    `;

/**
 * __useGetRegistrationsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetRegistrationsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetRegistrationsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationsByCompetitionIdQuery, GetRegistrationsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationsByCompetitionIdQuery, GetRegistrationsByCompetitionIdQueryVariables>(GetRegistrationsByCompetitionIdDocument, options);
      }
export function useGetRegistrationsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationsByCompetitionIdQuery, GetRegistrationsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationsByCompetitionIdQuery, GetRegistrationsByCompetitionIdQueryVariables>(GetRegistrationsByCompetitionIdDocument, options);
        }
export type GetRegistrationsByCompetitionIdQueryHookResult = ReturnType<typeof useGetRegistrationsByCompetitionIdQuery>;
export type GetRegistrationsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetRegistrationsByCompetitionIdLazyQuery>;
export type GetRegistrationsByCompetitionIdQueryResult = Apollo.QueryResult<GetRegistrationsByCompetitionIdQuery, GetRegistrationsByCompetitionIdQueryVariables>;
export const GetRegistrationsForExportDocument = gql`
    query GetRegistrationsForExport($competitionId: String!) {
  getRegistrationsByCompetitionId(competitionId: $competitionId) {
    id
    isCheckedIn
    user {
      name
      email
    }
    team {
      name
    }
    teamName
    ticketType {
      name
    }
    registrationAnswers {
      answer
      registrationField {
        question
        type
        isEditable
        options
      }
    }
  }
}
    `;

/**
 * __useGetRegistrationsForExportQuery__
 *
 * To run a query within a React component, call `useGetRegistrationsForExportQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegistrationsForExportQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegistrationsForExportQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetRegistrationsForExportQuery(baseOptions: Apollo.QueryHookOptions<GetRegistrationsForExportQuery, GetRegistrationsForExportQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetRegistrationsForExportQuery, GetRegistrationsForExportQueryVariables>(GetRegistrationsForExportDocument, options);
      }
export function useGetRegistrationsForExportLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetRegistrationsForExportQuery, GetRegistrationsForExportQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetRegistrationsForExportQuery, GetRegistrationsForExportQueryVariables>(GetRegistrationsForExportDocument, options);
        }
export type GetRegistrationsForExportQueryHookResult = ReturnType<typeof useGetRegistrationsForExportQuery>;
export type GetRegistrationsForExportLazyQueryHookResult = ReturnType<typeof useGetRegistrationsForExportLazyQuery>;
export type GetRegistrationsForExportQueryResult = Apollo.QueryResult<GetRegistrationsForExportQuery, GetRegistrationsForExportQueryVariables>;
export const GetScoreSettingByCompetitionIdDocument = gql`
    query GetScoreSettingByCompetitionId($competitionId: String!) {
  getScoreSettingByCompetitionId(competitionId: $competitionId) {
    id
    competitionId
    penalizeIncomplete
    ticketTypeOrderIds
    penalizeScaled
    totalHeatsPerWorkout
    firstHeatStartTime
    heatsEveryXMinutes
    oneTicketPerHeat
    scoring
    handleTie
    heatLimitType
    maxLimitPerHeat
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetScoreSettingByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetScoreSettingByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScoreSettingByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScoreSettingByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetScoreSettingByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetScoreSettingByCompetitionIdQuery, GetScoreSettingByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScoreSettingByCompetitionIdQuery, GetScoreSettingByCompetitionIdQueryVariables>(GetScoreSettingByCompetitionIdDocument, options);
      }
export function useGetScoreSettingByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScoreSettingByCompetitionIdQuery, GetScoreSettingByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScoreSettingByCompetitionIdQuery, GetScoreSettingByCompetitionIdQueryVariables>(GetScoreSettingByCompetitionIdDocument, options);
        }
export type GetScoreSettingByCompetitionIdQueryHookResult = ReturnType<typeof useGetScoreSettingByCompetitionIdQuery>;
export type GetScoreSettingByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetScoreSettingByCompetitionIdLazyQuery>;
export type GetScoreSettingByCompetitionIdQueryResult = Apollo.QueryResult<GetScoreSettingByCompetitionIdQuery, GetScoreSettingByCompetitionIdQueryVariables>;
export const GetScoreSettingByIdDocument = gql`
    query GetScoreSettingById($id: String!) {
  getScoreSettingById(id: $id) {
    id
    competitionId
    penalizeIncomplete
    penalizeScaled
    scoring
    handleTie
    createdAt
    updatedAt
  }
}
    `;

/**
 * __useGetScoreSettingByIdQuery__
 *
 * To run a query within a React component, call `useGetScoreSettingByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetScoreSettingByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetScoreSettingByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetScoreSettingByIdQuery(baseOptions: Apollo.QueryHookOptions<GetScoreSettingByIdQuery, GetScoreSettingByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetScoreSettingByIdQuery, GetScoreSettingByIdQueryVariables>(GetScoreSettingByIdDocument, options);
      }
export function useGetScoreSettingByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetScoreSettingByIdQuery, GetScoreSettingByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetScoreSettingByIdQuery, GetScoreSettingByIdQueryVariables>(GetScoreSettingByIdDocument, options);
        }
export type GetScoreSettingByIdQueryHookResult = ReturnType<typeof useGetScoreSettingByIdQuery>;
export type GetScoreSettingByIdLazyQueryHookResult = ReturnType<typeof useGetScoreSettingByIdLazyQuery>;
export type GetScoreSettingByIdQueryResult = Apollo.QueryResult<GetScoreSettingByIdQuery, GetScoreSettingByIdQueryVariables>;
export const GetSentEmailsDocument = gql`
    query GetSentEmails($compId: String!) {
  getSentEmails(compId: $compId) {
    id
    userId
    recipients
    subject
    message
    sentAt
  }
}
    `;

/**
 * __useGetSentEmailsQuery__
 *
 * To run a query within a React component, call `useGetSentEmailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSentEmailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSentEmailsQuery({
 *   variables: {
 *      compId: // value for 'compId'
 *   },
 * });
 */
export function useGetSentEmailsQuery(baseOptions: Apollo.QueryHookOptions<GetSentEmailsQuery, GetSentEmailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSentEmailsQuery, GetSentEmailsQueryVariables>(GetSentEmailsDocument, options);
      }
export function useGetSentEmailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSentEmailsQuery, GetSentEmailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSentEmailsQuery, GetSentEmailsQueryVariables>(GetSentEmailsDocument, options);
        }
export type GetSentEmailsQueryHookResult = ReturnType<typeof useGetSentEmailsQuery>;
export type GetSentEmailsLazyQueryHookResult = ReturnType<typeof useGetSentEmailsLazyQuery>;
export type GetSentEmailsQueryResult = Apollo.QueryResult<GetSentEmailsQuery, GetSentEmailsQueryVariables>;
export const GetTicketTypesByCompetitionIdDocument = gql`
    query GetTicketTypesByCompetitionId($competitionId: String!) {
  getTicketTypesByCompetitionId(competitionId: $competitionId) {
    id
    name
    description
    maxEntries
    price
    teamSize
    currency
    isVolunteer
    competitionId
    createdAt
    isTeamNameRequired
    registered
    allowHeatSelection
    hasAvailability
    registrationFields {
      id
      question
      type
      requiredStatus
      options
    }
  }
}
    `;

/**
 * __useGetTicketTypesByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetTicketTypesByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTicketTypesByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTicketTypesByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetTicketTypesByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetTicketTypesByCompetitionIdQuery, GetTicketTypesByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTicketTypesByCompetitionIdQuery, GetTicketTypesByCompetitionIdQueryVariables>(GetTicketTypesByCompetitionIdDocument, options);
      }
export function useGetTicketTypesByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTicketTypesByCompetitionIdQuery, GetTicketTypesByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTicketTypesByCompetitionIdQuery, GetTicketTypesByCompetitionIdQueryVariables>(GetTicketTypesByCompetitionIdDocument, options);
        }
export type GetTicketTypesByCompetitionIdQueryHookResult = ReturnType<typeof useGetTicketTypesByCompetitionIdQuery>;
export type GetTicketTypesByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetTicketTypesByCompetitionIdLazyQuery>;
export type GetTicketTypesByCompetitionIdQueryResult = Apollo.QueryResult<GetTicketTypesByCompetitionIdQuery, GetTicketTypesByCompetitionIdQueryVariables>;
export const GetTicketTypeByIdDocument = gql`
    query GetTicketTypeById($ticketId: String!) {
  getTicketTypeById(ticketId: $ticketId) {
    id
    name
    description
    maxEntries
    price
    teamSize
    currency
    isVolunteer
    offerEarlyBird
    competitionId
    createdAt
    registered
    updatedAt
    registrationFields {
      id
      question
      type
      repeatPerAthlete
      requiredStatus
      options
    }
  }
}
    `;

/**
 * __useGetTicketTypeByIdQuery__
 *
 * To run a query within a React component, call `useGetTicketTypeByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTicketTypeByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTicketTypeByIdQuery({
 *   variables: {
 *      ticketId: // value for 'ticketId'
 *   },
 * });
 */
export function useGetTicketTypeByIdQuery(baseOptions: Apollo.QueryHookOptions<GetTicketTypeByIdQuery, GetTicketTypeByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTicketTypeByIdQuery, GetTicketTypeByIdQueryVariables>(GetTicketTypeByIdDocument, options);
      }
export function useGetTicketTypeByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTicketTypeByIdQuery, GetTicketTypeByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTicketTypeByIdQuery, GetTicketTypeByIdQueryVariables>(GetTicketTypeByIdDocument, options);
        }
export type GetTicketTypeByIdQueryHookResult = ReturnType<typeof useGetTicketTypeByIdQuery>;
export type GetTicketTypeByIdLazyQueryHookResult = ReturnType<typeof useGetTicketTypeByIdLazyQuery>;
export type GetTicketTypeByIdQueryResult = Apollo.QueryResult<GetTicketTypeByIdQuery, GetTicketTypeByIdQueryVariables>;
export const GetTicketTypesIdAndNameByCompetitionIdDocument = gql`
    query GetTicketTypesIdAndNameByCompetitionId($competitionId: String!) {
  getTicketTypesByCompetitionId(competitionId: $competitionId) {
    id
    name
    isVolunteer
  }
}
    `;

/**
 * __useGetTicketTypesIdAndNameByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetTicketTypesIdAndNameByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTicketTypesIdAndNameByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTicketTypesIdAndNameByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetTicketTypesIdAndNameByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetTicketTypesIdAndNameByCompetitionIdQuery, GetTicketTypesIdAndNameByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTicketTypesIdAndNameByCompetitionIdQuery, GetTicketTypesIdAndNameByCompetitionIdQueryVariables>(GetTicketTypesIdAndNameByCompetitionIdDocument, options);
      }
export function useGetTicketTypesIdAndNameByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTicketTypesIdAndNameByCompetitionIdQuery, GetTicketTypesIdAndNameByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTicketTypesIdAndNameByCompetitionIdQuery, GetTicketTypesIdAndNameByCompetitionIdQueryVariables>(GetTicketTypesIdAndNameByCompetitionIdDocument, options);
        }
export type GetTicketTypesIdAndNameByCompetitionIdQueryHookResult = ReturnType<typeof useGetTicketTypesIdAndNameByCompetitionIdQuery>;
export type GetTicketTypesIdAndNameByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetTicketTypesIdAndNameByCompetitionIdLazyQuery>;
export type GetTicketTypesIdAndNameByCompetitionIdQueryResult = Apollo.QueryResult<GetTicketTypesIdAndNameByCompetitionIdQuery, GetTicketTypesIdAndNameByCompetitionIdQueryVariables>;
export const GetUnassignedEntriesByCompetitionIdDocument = gql`
    query GetUnassignedEntriesByCompetitionId($competitionId: String!) {
  getUnassignedEntriesByCompetitionId(competitionId: $competitionId) {
    id
    name
    ticketType {
      id
      name
      teamSize
    }
    team {
      id
      members {
        id
        user {
          id
          name
        }
      }
    }
  }
}
    `;

/**
 * __useGetUnassignedEntriesByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetUnassignedEntriesByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUnassignedEntriesByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUnassignedEntriesByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetUnassignedEntriesByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetUnassignedEntriesByCompetitionIdQuery, GetUnassignedEntriesByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUnassignedEntriesByCompetitionIdQuery, GetUnassignedEntriesByCompetitionIdQueryVariables>(GetUnassignedEntriesByCompetitionIdDocument, options);
      }
export function useGetUnassignedEntriesByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUnassignedEntriesByCompetitionIdQuery, GetUnassignedEntriesByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUnassignedEntriesByCompetitionIdQuery, GetUnassignedEntriesByCompetitionIdQueryVariables>(GetUnassignedEntriesByCompetitionIdDocument, options);
        }
export type GetUnassignedEntriesByCompetitionIdQueryHookResult = ReturnType<typeof useGetUnassignedEntriesByCompetitionIdQuery>;
export type GetUnassignedEntriesByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetUnassignedEntriesByCompetitionIdLazyQuery>;
export type GetUnassignedEntriesByCompetitionIdQueryResult = Apollo.QueryResult<GetUnassignedEntriesByCompetitionIdQuery, GetUnassignedEntriesByCompetitionIdQueryVariables>;
export const GetUserScheduleDocument = gql`
    query GetUserSchedule($userId: String!, $competitionId: String!) {
  getUserSchedule(userId: $userId, competitionId: $competitionId) {
    workout {
      id
      name
    }
    heat {
      id
      name
      startTime
      lanes {
        entry {
          name
          team {
            name
            members {
              user {
                name
              }
            }
          }
        }
      }
    }
  }
}
    `;

/**
 * __useGetUserScheduleQuery__
 *
 * To run a query within a React component, call `useGetUserScheduleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserScheduleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserScheduleQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetUserScheduleQuery(baseOptions: Apollo.QueryHookOptions<GetUserScheduleQuery, GetUserScheduleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUserScheduleQuery, GetUserScheduleQueryVariables>(GetUserScheduleDocument, options);
      }
export function useGetUserScheduleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUserScheduleQuery, GetUserScheduleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUserScheduleQuery, GetUserScheduleQueryVariables>(GetUserScheduleDocument, options);
        }
export type GetUserScheduleQueryHookResult = ReturnType<typeof useGetUserScheduleQuery>;
export type GetUserScheduleLazyQueryHookResult = ReturnType<typeof useGetUserScheduleLazyQuery>;
export type GetUserScheduleQueryResult = Apollo.QueryResult<GetUserScheduleQuery, GetUserScheduleQueryVariables>;
export const GetViewerDocument = gql`
    query GetViewer {
  getUser {
    id
    firstName
    lastName
    email
    picture
    bio
    isSuperUser
    isVerified
    createdAt
    updatedAt
    invitationId
    referredBy
    referralCode
    orgId
  }
}
    `;

/**
 * __useGetViewerQuery__
 *
 * To run a query within a React component, call `useGetViewerQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewerQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewerQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetViewerQuery(baseOptions?: Apollo.QueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, options);
      }
export function useGetViewerLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewerQuery, GetViewerQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewerQuery, GetViewerQueryVariables>(GetViewerDocument, options);
        }
export type GetViewerQueryHookResult = ReturnType<typeof useGetViewerQuery>;
export type GetViewerLazyQueryHookResult = ReturnType<typeof useGetViewerLazyQuery>;
export type GetViewerQueryResult = Apollo.QueryResult<GetViewerQuery, GetViewerQueryVariables>;
export const GetViewerCompsDocument = gql`
    query GetViewerComps {
  getCompetitionsByUser {
    id
    name
    startDateTime
    registrationsCount
  }
}
    `;

/**
 * __useGetViewerCompsQuery__
 *
 * To run a query within a React component, call `useGetViewerCompsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetViewerCompsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetViewerCompsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetViewerCompsQuery(baseOptions?: Apollo.QueryHookOptions<GetViewerCompsQuery, GetViewerCompsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetViewerCompsQuery, GetViewerCompsQueryVariables>(GetViewerCompsDocument, options);
      }
export function useGetViewerCompsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetViewerCompsQuery, GetViewerCompsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetViewerCompsQuery, GetViewerCompsQueryVariables>(GetViewerCompsDocument, options);
        }
export type GetViewerCompsQueryHookResult = ReturnType<typeof useGetViewerCompsQuery>;
export type GetViewerCompsLazyQueryHookResult = ReturnType<typeof useGetViewerCompsLazyQuery>;
export type GetViewerCompsQueryResult = Apollo.QueryResult<GetViewerCompsQuery, GetViewerCompsQueryVariables>;
export const GetWorkoutByIdDocument = gql`
    query GetWorkoutById($id: String!) {
  getWorkoutById(id: $id) {
    id
    unitOfMeasurement
    scoreType
    isVisible
  }
}
    `;

/**
 * __useGetWorkoutByIdQuery__
 *
 * To run a query within a React component, call `useGetWorkoutByIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkoutByIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkoutByIdQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetWorkoutByIdQuery(baseOptions: Apollo.QueryHookOptions<GetWorkoutByIdQuery, GetWorkoutByIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkoutByIdQuery, GetWorkoutByIdQueryVariables>(GetWorkoutByIdDocument, options);
      }
export function useGetWorkoutByIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkoutByIdQuery, GetWorkoutByIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkoutByIdQuery, GetWorkoutByIdQueryVariables>(GetWorkoutByIdDocument, options);
        }
export type GetWorkoutByIdQueryHookResult = ReturnType<typeof useGetWorkoutByIdQuery>;
export type GetWorkoutByIdLazyQueryHookResult = ReturnType<typeof useGetWorkoutByIdLazyQuery>;
export type GetWorkoutByIdQueryResult = Apollo.QueryResult<GetWorkoutByIdQuery, GetWorkoutByIdQueryVariables>;
export const GetWorkoutNamesByCompetitionIdDocument = gql`
    query GetWorkoutNamesByCompetitionId($competitionId: String!) {
  getWorkoutsByCompetitionId(competitionId: $competitionId) {
    id
    name
    unitOfMeasurement
    scoreType
  }
}
    `;

/**
 * __useGetWorkoutNamesByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetWorkoutNamesByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkoutNamesByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkoutNamesByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetWorkoutNamesByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetWorkoutNamesByCompetitionIdQuery, GetWorkoutNamesByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkoutNamesByCompetitionIdQuery, GetWorkoutNamesByCompetitionIdQueryVariables>(GetWorkoutNamesByCompetitionIdDocument, options);
      }
export function useGetWorkoutNamesByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkoutNamesByCompetitionIdQuery, GetWorkoutNamesByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkoutNamesByCompetitionIdQuery, GetWorkoutNamesByCompetitionIdQueryVariables>(GetWorkoutNamesByCompetitionIdDocument, options);
        }
export type GetWorkoutNamesByCompetitionIdQueryHookResult = ReturnType<typeof useGetWorkoutNamesByCompetitionIdQuery>;
export type GetWorkoutNamesByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetWorkoutNamesByCompetitionIdLazyQuery>;
export type GetWorkoutNamesByCompetitionIdQueryResult = Apollo.QueryResult<GetWorkoutNamesByCompetitionIdQuery, GetWorkoutNamesByCompetitionIdQueryVariables>;
export const GetWorkoutsByCompetitionIdDocument = gql`
    query GetWorkoutsByCompetitionId($competitionId: String!) {
  getWorkoutsByCompetitionId(competitionId: $competitionId) {
    id
    name
    description
    releaseDateTime
    competitionId
    location
    scoreType
    unitOfMeasurement
    timeCap
    includeStandardsVideo
    createdAt
    updatedAt
    isVisible
    videos {
      id
      title
      description
      url
      orderIndex
    }
    scoreSetting {
      id
      penalizeIncomplete
      penalizeScaled
      handleTie
    }
  }
}
    `;

/**
 * __useGetWorkoutsByCompetitionIdQuery__
 *
 * To run a query within a React component, call `useGetWorkoutsByCompetitionIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetWorkoutsByCompetitionIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetWorkoutsByCompetitionIdQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useGetWorkoutsByCompetitionIdQuery(baseOptions: Apollo.QueryHookOptions<GetWorkoutsByCompetitionIdQuery, GetWorkoutsByCompetitionIdQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetWorkoutsByCompetitionIdQuery, GetWorkoutsByCompetitionIdQueryVariables>(GetWorkoutsByCompetitionIdDocument, options);
      }
export function useGetWorkoutsByCompetitionIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetWorkoutsByCompetitionIdQuery, GetWorkoutsByCompetitionIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetWorkoutsByCompetitionIdQuery, GetWorkoutsByCompetitionIdQueryVariables>(GetWorkoutsByCompetitionIdDocument, options);
        }
export type GetWorkoutsByCompetitionIdQueryHookResult = ReturnType<typeof useGetWorkoutsByCompetitionIdQuery>;
export type GetWorkoutsByCompetitionIdLazyQueryHookResult = ReturnType<typeof useGetWorkoutsByCompetitionIdLazyQuery>;
export type GetWorkoutsByCompetitionIdQueryResult = Apollo.QueryResult<GetWorkoutsByCompetitionIdQuery, GetWorkoutsByCompetitionIdQueryVariables>;
export const InviteToCompetitionDocument = gql`
    mutation InviteToCompetition($competitionId: String!, $email: String!) {
  inviteToCompetition(competitionId: $competitionId, email: $email)
}
    `;
export type InviteToCompetitionMutationFn = Apollo.MutationFunction<InviteToCompetitionMutation, InviteToCompetitionMutationVariables>;

/**
 * __useInviteToCompetitionMutation__
 *
 * To run a mutation, you first call `useInviteToCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInviteToCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [inviteToCompetitionMutation, { data, loading, error }] = useInviteToCompetitionMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useInviteToCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<InviteToCompetitionMutation, InviteToCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<InviteToCompetitionMutation, InviteToCompetitionMutationVariables>(InviteToCompetitionDocument, options);
      }
export type InviteToCompetitionMutationHookResult = ReturnType<typeof useInviteToCompetitionMutation>;
export type InviteToCompetitionMutationResult = Apollo.MutationResult<InviteToCompetitionMutation>;
export type InviteToCompetitionMutationOptions = Apollo.BaseMutationOptions<InviteToCompetitionMutation, InviteToCompetitionMutationVariables>;
export const IsUserRegisteredForCompetitionDocument = gql`
    query IsUserRegisteredForCompetition($competitionId: String!) {
  isUserRegisteredForCompetition(competitionId: $competitionId)
}
    `;

/**
 * __useIsUserRegisteredForCompetitionQuery__
 *
 * To run a query within a React component, call `useIsUserRegisteredForCompetitionQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsUserRegisteredForCompetitionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsUserRegisteredForCompetitionQuery({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useIsUserRegisteredForCompetitionQuery(baseOptions: Apollo.QueryHookOptions<IsUserRegisteredForCompetitionQuery, IsUserRegisteredForCompetitionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<IsUserRegisteredForCompetitionQuery, IsUserRegisteredForCompetitionQueryVariables>(IsUserRegisteredForCompetitionDocument, options);
      }
export function useIsUserRegisteredForCompetitionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<IsUserRegisteredForCompetitionQuery, IsUserRegisteredForCompetitionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<IsUserRegisteredForCompetitionQuery, IsUserRegisteredForCompetitionQueryVariables>(IsUserRegisteredForCompetitionDocument, options);
        }
export type IsUserRegisteredForCompetitionQueryHookResult = ReturnType<typeof useIsUserRegisteredForCompetitionQuery>;
export type IsUserRegisteredForCompetitionLazyQueryHookResult = ReturnType<typeof useIsUserRegisteredForCompetitionLazyQuery>;
export type IsUserRegisteredForCompetitionQueryResult = Apollo.QueryResult<IsUserRegisteredForCompetitionQuery, IsUserRegisteredForCompetitionQueryVariables>;
export const LinkDirectoryCompToCompetitionDocument = gql`
    mutation LinkDirectoryCompToCompetition($directoryCompId: String!, $competitionId: String!) {
  linkDirectoryCompToCompetition(
    directoryCompId: $directoryCompId
    competitionId: $competitionId
  )
}
    `;
export type LinkDirectoryCompToCompetitionMutationFn = Apollo.MutationFunction<LinkDirectoryCompToCompetitionMutation, LinkDirectoryCompToCompetitionMutationVariables>;

/**
 * __useLinkDirectoryCompToCompetitionMutation__
 *
 * To run a mutation, you first call `useLinkDirectoryCompToCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLinkDirectoryCompToCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [linkDirectoryCompToCompetitionMutation, { data, loading, error }] = useLinkDirectoryCompToCompetitionMutation({
 *   variables: {
 *      directoryCompId: // value for 'directoryCompId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useLinkDirectoryCompToCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<LinkDirectoryCompToCompetitionMutation, LinkDirectoryCompToCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LinkDirectoryCompToCompetitionMutation, LinkDirectoryCompToCompetitionMutationVariables>(LinkDirectoryCompToCompetitionDocument, options);
      }
export type LinkDirectoryCompToCompetitionMutationHookResult = ReturnType<typeof useLinkDirectoryCompToCompetitionMutation>;
export type LinkDirectoryCompToCompetitionMutationResult = Apollo.MutationResult<LinkDirectoryCompToCompetitionMutation>;
export type LinkDirectoryCompToCompetitionMutationOptions = Apollo.BaseMutationOptions<LinkDirectoryCompToCompetitionMutation, LinkDirectoryCompToCompetitionMutationVariables>;
export const LoginDocument = gql`
    mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    user {
      id
      firstName
      lastName
      email
      isSuperUser
      isVerified
      picture
      createdAt
      updatedAt
      invitationId
      referredBy
      referralCode
      orgId
    }
    error
  }
}
    `;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = gql`
    mutation Logout {
  logout {
    success
    message
  }
}
    `;
export type LogoutMutationFn = Apollo.MutationFunction<LogoutMutation, LogoutMutationVariables>;

/**
 * __useLogoutMutation__
 *
 * To run a mutation, you first call `useLogoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLogoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [logoutMutation, { data, loading, error }] = useLogoutMutation({
 *   variables: {
 *   },
 * });
 */
export function useLogoutMutation(baseOptions?: Apollo.MutationHookOptions<LogoutMutation, LogoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<LogoutMutation, LogoutMutationVariables>(LogoutDocument, options);
      }
export type LogoutMutationHookResult = ReturnType<typeof useLogoutMutation>;
export type LogoutMutationResult = Apollo.MutationResult<LogoutMutation>;
export type LogoutMutationOptions = Apollo.BaseMutationOptions<LogoutMutation, LogoutMutationVariables>;
export const MoveAthleteToTeamDocument = gql`
    mutation MoveAthleteToTeam($userId: String!, $competitionId: String!, $targetTeamId: String!) {
  moveAthleteToTeam(
    userId: $userId
    competitionId: $competitionId
    targetTeamId: $targetTeamId
  )
}
    `;
export type MoveAthleteToTeamMutationFn = Apollo.MutationFunction<MoveAthleteToTeamMutation, MoveAthleteToTeamMutationVariables>;

/**
 * __useMoveAthleteToTeamMutation__
 *
 * To run a mutation, you first call `useMoveAthleteToTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveAthleteToTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveAthleteToTeamMutation, { data, loading, error }] = useMoveAthleteToTeamMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      competitionId: // value for 'competitionId'
 *      targetTeamId: // value for 'targetTeamId'
 *   },
 * });
 */
export function useMoveAthleteToTeamMutation(baseOptions?: Apollo.MutationHookOptions<MoveAthleteToTeamMutation, MoveAthleteToTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MoveAthleteToTeamMutation, MoveAthleteToTeamMutationVariables>(MoveAthleteToTeamDocument, options);
      }
export type MoveAthleteToTeamMutationHookResult = ReturnType<typeof useMoveAthleteToTeamMutation>;
export type MoveAthleteToTeamMutationResult = Apollo.MutationResult<MoveAthleteToTeamMutation>;
export type MoveAthleteToTeamMutationOptions = Apollo.BaseMutationOptions<MoveAthleteToTeamMutation, MoveAthleteToTeamMutationVariables>;
export const RejectPotentialCompetitionsDocument = gql`
    mutation RejectPotentialCompetitions($potentialCompetitionIds: [String!]!) {
  rejectPotentialCompetitions(potentialCompetitionIds: $potentialCompetitionIds)
}
    `;
export type RejectPotentialCompetitionsMutationFn = Apollo.MutationFunction<RejectPotentialCompetitionsMutation, RejectPotentialCompetitionsMutationVariables>;

/**
 * __useRejectPotentialCompetitionsMutation__
 *
 * To run a mutation, you first call `useRejectPotentialCompetitionsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRejectPotentialCompetitionsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rejectPotentialCompetitionsMutation, { data, loading, error }] = useRejectPotentialCompetitionsMutation({
 *   variables: {
 *      potentialCompetitionIds: // value for 'potentialCompetitionIds'
 *   },
 * });
 */
export function useRejectPotentialCompetitionsMutation(baseOptions?: Apollo.MutationHookOptions<RejectPotentialCompetitionsMutation, RejectPotentialCompetitionsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RejectPotentialCompetitionsMutation, RejectPotentialCompetitionsMutationVariables>(RejectPotentialCompetitionsDocument, options);
      }
export type RejectPotentialCompetitionsMutationHookResult = ReturnType<typeof useRejectPotentialCompetitionsMutation>;
export type RejectPotentialCompetitionsMutationResult = Apollo.MutationResult<RejectPotentialCompetitionsMutation>;
export type RejectPotentialCompetitionsMutationOptions = Apollo.BaseMutationOptions<RejectPotentialCompetitionsMutation, RejectPotentialCompetitionsMutationVariables>;
export const RequestDirectoryCompEditDocument = gql`
    mutation RequestDirectoryCompEdit($input: RequestDirectoryCompEditInput!) {
  requestDirectoryCompEdit(input: $input)
}
    `;
export type RequestDirectoryCompEditMutationFn = Apollo.MutationFunction<RequestDirectoryCompEditMutation, RequestDirectoryCompEditMutationVariables>;

/**
 * __useRequestDirectoryCompEditMutation__
 *
 * To run a mutation, you first call `useRequestDirectoryCompEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRequestDirectoryCompEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [requestDirectoryCompEditMutation, { data, loading, error }] = useRequestDirectoryCompEditMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRequestDirectoryCompEditMutation(baseOptions?: Apollo.MutationHookOptions<RequestDirectoryCompEditMutation, RequestDirectoryCompEditMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RequestDirectoryCompEditMutation, RequestDirectoryCompEditMutationVariables>(RequestDirectoryCompEditDocument, options);
      }
export type RequestDirectoryCompEditMutationHookResult = ReturnType<typeof useRequestDirectoryCompEditMutation>;
export type RequestDirectoryCompEditMutationResult = Apollo.MutationResult<RequestDirectoryCompEditMutation>;
export type RequestDirectoryCompEditMutationOptions = Apollo.BaseMutationOptions<RequestDirectoryCompEditMutation, RequestDirectoryCompEditMutationVariables>;
export const ResendInvitationDocument = gql`
    mutation ResendInvitation($invitationId: String!) {
  resendInvitation(invitationId: $invitationId)
}
    `;
export type ResendInvitationMutationFn = Apollo.MutationFunction<ResendInvitationMutation, ResendInvitationMutationVariables>;

/**
 * __useResendInvitationMutation__
 *
 * To run a mutation, you first call `useResendInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResendInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resendInvitationMutation, { data, loading, error }] = useResendInvitationMutation({
 *   variables: {
 *      invitationId: // value for 'invitationId'
 *   },
 * });
 */
export function useResendInvitationMutation(baseOptions?: Apollo.MutationHookOptions<ResendInvitationMutation, ResendInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResendInvitationMutation, ResendInvitationMutationVariables>(ResendInvitationDocument, options);
      }
export type ResendInvitationMutationHookResult = ReturnType<typeof useResendInvitationMutation>;
export type ResendInvitationMutationResult = Apollo.MutationResult<ResendInvitationMutation>;
export type ResendInvitationMutationOptions = Apollo.BaseMutationOptions<ResendInvitationMutation, ResendInvitationMutationVariables>;
export const ResetPasswordDocument = gql`
    mutation ResetPassword($password: String!, $token: String!) {
  resetPassword(password: $password, token: $token) {
    success
    error
  }
}
    `;
export type ResetPasswordMutationFn = Apollo.MutationFunction<ResetPasswordMutation, ResetPasswordMutationVariables>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      password: // value for 'password'
 *      token: // value for 'token'
 *   },
 * });
 */
export function useResetPasswordMutation(baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(ResetPasswordDocument, options);
      }
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const ScheduleDayBeforeEventEmailDocument = gql`
    mutation ScheduleDayBeforeEventEmail($competitionId: ID!) {
  scheduleDayBeforeEventEmail(competitionId: $competitionId)
}
    `;
export type ScheduleDayBeforeEventEmailMutationFn = Apollo.MutationFunction<ScheduleDayBeforeEventEmailMutation, ScheduleDayBeforeEventEmailMutationVariables>;

/**
 * __useScheduleDayBeforeEventEmailMutation__
 *
 * To run a mutation, you first call `useScheduleDayBeforeEventEmailMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useScheduleDayBeforeEventEmailMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [scheduleDayBeforeEventEmailMutation, { data, loading, error }] = useScheduleDayBeforeEventEmailMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useScheduleDayBeforeEventEmailMutation(baseOptions?: Apollo.MutationHookOptions<ScheduleDayBeforeEventEmailMutation, ScheduleDayBeforeEventEmailMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<ScheduleDayBeforeEventEmailMutation, ScheduleDayBeforeEventEmailMutationVariables>(ScheduleDayBeforeEventEmailDocument, options);
      }
export type ScheduleDayBeforeEventEmailMutationHookResult = ReturnType<typeof useScheduleDayBeforeEventEmailMutation>;
export type ScheduleDayBeforeEventEmailMutationResult = Apollo.MutationResult<ScheduleDayBeforeEventEmailMutation>;
export type ScheduleDayBeforeEventEmailMutationOptions = Apollo.BaseMutationOptions<ScheduleDayBeforeEventEmailMutation, ScheduleDayBeforeEventEmailMutationVariables>;
export const SendEmailsDocument = gql`
    mutation SendEmails($recipients: [String!]!, $subject: String!, $message: String!, $competitionId: String!) {
  sendEmails(
    recipients: $recipients
    subject: $subject
    message: $message
    competitionId: $competitionId
  )
}
    `;
export type SendEmailsMutationFn = Apollo.MutationFunction<SendEmailsMutation, SendEmailsMutationVariables>;

/**
 * __useSendEmailsMutation__
 *
 * To run a mutation, you first call `useSendEmailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendEmailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendEmailsMutation, { data, loading, error }] = useSendEmailsMutation({
 *   variables: {
 *      recipients: // value for 'recipients'
 *      subject: // value for 'subject'
 *      message: // value for 'message'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useSendEmailsMutation(baseOptions?: Apollo.MutationHookOptions<SendEmailsMutation, SendEmailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendEmailsMutation, SendEmailsMutationVariables>(SendEmailsDocument, options);
      }
export type SendEmailsMutationHookResult = ReturnType<typeof useSendEmailsMutation>;
export type SendEmailsMutationResult = Apollo.MutationResult<SendEmailsMutation>;
export type SendEmailsMutationOptions = Apollo.BaseMutationOptions<SendEmailsMutation, SendEmailsMutationVariables>;
export const SendInvitationsDocument = gql`
    mutation SendInvitations($emails: [String!]!, $competitionId: String!) {
  sendInvitations(emails: $emails, competitionId: $competitionId)
}
    `;
export type SendInvitationsMutationFn = Apollo.MutationFunction<SendInvitationsMutation, SendInvitationsMutationVariables>;

/**
 * __useSendInvitationsMutation__
 *
 * To run a mutation, you first call `useSendInvitationsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendInvitationsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendInvitationsMutation, { data, loading, error }] = useSendInvitationsMutation({
 *   variables: {
 *      emails: // value for 'emails'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useSendInvitationsMutation(baseOptions?: Apollo.MutationHookOptions<SendInvitationsMutation, SendInvitationsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendInvitationsMutation, SendInvitationsMutationVariables>(SendInvitationsDocument, options);
      }
export type SendInvitationsMutationHookResult = ReturnType<typeof useSendInvitationsMutation>;
export type SendInvitationsMutationResult = Apollo.MutationResult<SendInvitationsMutation>;
export type SendInvitationsMutationOptions = Apollo.BaseMutationOptions<SendInvitationsMutation, SendInvitationsMutationVariables>;
export const SendLoginTokenDocument = gql`
    mutation SendLoginToken($input: SendLoginTokenInput!) {
  sendLoginToken(input: $input)
}
    `;
export type SendLoginTokenMutationFn = Apollo.MutationFunction<SendLoginTokenMutation, SendLoginTokenMutationVariables>;

/**
 * __useSendLoginTokenMutation__
 *
 * To run a mutation, you first call `useSendLoginTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendLoginTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendLoginTokenMutation, { data, loading, error }] = useSendLoginTokenMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendLoginTokenMutation(baseOptions?: Apollo.MutationHookOptions<SendLoginTokenMutation, SendLoginTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SendLoginTokenMutation, SendLoginTokenMutationVariables>(SendLoginTokenDocument, options);
      }
export type SendLoginTokenMutationHookResult = ReturnType<typeof useSendLoginTokenMutation>;
export type SendLoginTokenMutationResult = Apollo.MutationResult<SendLoginTokenMutation>;
export type SendLoginTokenMutationOptions = Apollo.BaseMutationOptions<SendLoginTokenMutation, SendLoginTokenMutationVariables>;
export const SignUpDocument = gql`
    mutation SignUp($email: String!, $password: String!, $firstName: String!, $lastName: String!) {
  signUp(
    email: $email
    password: $password
    firstName: $firstName
    lastName: $lastName
  ) {
    user {
      id
      firstName
      lastName
      email
      isSuperUser
      isVerified
      picture
      bio
      createdAt
      updatedAt
      invitationId
      referredBy
      referralCode
      orgId
    }
    error
  }
}
    `;
export type SignUpMutationFn = Apollo.MutationFunction<SignUpMutation, SignUpMutationVariables>;

/**
 * __useSignUpMutation__
 *
 * To run a mutation, you first call `useSignUpMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpMutation, { data, loading, error }] = useSignUpMutation({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *   },
 * });
 */
export function useSignUpMutation(baseOptions?: Apollo.MutationHookOptions<SignUpMutation, SignUpMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpMutation, SignUpMutationVariables>(SignUpDocument, options);
      }
export type SignUpMutationHookResult = ReturnType<typeof useSignUpMutation>;
export type SignUpMutationResult = Apollo.MutationResult<SignUpMutation>;
export type SignUpMutationOptions = Apollo.BaseMutationOptions<SignUpMutation, SignUpMutationVariables>;
export const SubmitFeedbackDocument = gql`
    mutation SubmitFeedback($text: String!) {
  submitFeedback(text: $text) {
    id
    text
    createdAt
  }
}
    `;
export type SubmitFeedbackMutationFn = Apollo.MutationFunction<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>;

/**
 * __useSubmitFeedbackMutation__
 *
 * To run a mutation, you first call `useSubmitFeedbackMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitFeedbackMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitFeedbackMutation, { data, loading, error }] = useSubmitFeedbackMutation({
 *   variables: {
 *      text: // value for 'text'
 *   },
 * });
 */
export function useSubmitFeedbackMutation(baseOptions?: Apollo.MutationHookOptions<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>(SubmitFeedbackDocument, options);
      }
export type SubmitFeedbackMutationHookResult = ReturnType<typeof useSubmitFeedbackMutation>;
export type SubmitFeedbackMutationResult = Apollo.MutationResult<SubmitFeedbackMutation>;
export type SubmitFeedbackMutationOptions = Apollo.BaseMutationOptions<SubmitFeedbackMutation, SubmitFeedbackMutationVariables>;
export const SuggestCompetitionEditDocument = gql`
    mutation SuggestCompetitionEdit($competitionId: String!, $name: String, $description: String, $website: String, $email: String, $venue: String, $city: String, $country: String, $price: Float, $currency: String, $reason: String) {
  suggestCompetitionEdit(
    competitionId: $competitionId
    name: $name
    description: $description
    website: $website
    email: $email
    venue: $venue
    city: $city
    country: $country
    price: $price
    currency: $currency
    reason: $reason
  )
}
    `;
export type SuggestCompetitionEditMutationFn = Apollo.MutationFunction<SuggestCompetitionEditMutation, SuggestCompetitionEditMutationVariables>;

/**
 * __useSuggestCompetitionEditMutation__
 *
 * To run a mutation, you first call `useSuggestCompetitionEditMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSuggestCompetitionEditMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [suggestCompetitionEditMutation, { data, loading, error }] = useSuggestCompetitionEditMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      website: // value for 'website'
 *      email: // value for 'email'
 *      venue: // value for 'venue'
 *      city: // value for 'city'
 *      country: // value for 'country'
 *      price: // value for 'price'
 *      currency: // value for 'currency'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useSuggestCompetitionEditMutation(baseOptions?: Apollo.MutationHookOptions<SuggestCompetitionEditMutation, SuggestCompetitionEditMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SuggestCompetitionEditMutation, SuggestCompetitionEditMutationVariables>(SuggestCompetitionEditDocument, options);
      }
export type SuggestCompetitionEditMutationHookResult = ReturnType<typeof useSuggestCompetitionEditMutation>;
export type SuggestCompetitionEditMutationResult = Apollo.MutationResult<SuggestCompetitionEditMutation>;
export type SuggestCompetitionEditMutationOptions = Apollo.BaseMutationOptions<SuggestCompetitionEditMutation, SuggestCompetitionEditMutationVariables>;
export const SuggestNewCompetitionDocument = gql`
    mutation SuggestNewCompetition($name: String!, $description: String, $website: String, $email: String, $venue: String, $city: String, $country: String, $startDate: String, $endDate: String, $price: Float, $currency: String, $reason: String) {
  suggestNewCompetition(
    name: $name
    description: $description
    website: $website
    email: $email
    venue: $venue
    city: $city
    country: $country
    startDate: $startDate
    endDate: $endDate
    price: $price
    currency: $currency
    reason: $reason
  )
}
    `;
export type SuggestNewCompetitionMutationFn = Apollo.MutationFunction<SuggestNewCompetitionMutation, SuggestNewCompetitionMutationVariables>;

/**
 * __useSuggestNewCompetitionMutation__
 *
 * To run a mutation, you first call `useSuggestNewCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSuggestNewCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [suggestNewCompetitionMutation, { data, loading, error }] = useSuggestNewCompetitionMutation({
 *   variables: {
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      website: // value for 'website'
 *      email: // value for 'email'
 *      venue: // value for 'venue'
 *      city: // value for 'city'
 *      country: // value for 'country'
 *      startDate: // value for 'startDate'
 *      endDate: // value for 'endDate'
 *      price: // value for 'price'
 *      currency: // value for 'currency'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useSuggestNewCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<SuggestNewCompetitionMutation, SuggestNewCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SuggestNewCompetitionMutation, SuggestNewCompetitionMutationVariables>(SuggestNewCompetitionDocument, options);
      }
export type SuggestNewCompetitionMutationHookResult = ReturnType<typeof useSuggestNewCompetitionMutation>;
export type SuggestNewCompetitionMutationResult = Apollo.MutationResult<SuggestNewCompetitionMutation>;
export type SuggestNewCompetitionMutationOptions = Apollo.BaseMutationOptions<SuggestNewCompetitionMutation, SuggestNewCompetitionMutationVariables>;
export const UnassignAllEntriesDocument = gql`
    mutation UnassignAllEntries($competitionId: String!) {
  unassignAllEntries(competitionId: $competitionId)
}
    `;
export type UnassignAllEntriesMutationFn = Apollo.MutationFunction<UnassignAllEntriesMutation, UnassignAllEntriesMutationVariables>;

/**
 * __useUnassignAllEntriesMutation__
 *
 * To run a mutation, you first call `useUnassignAllEntriesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnassignAllEntriesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unassignAllEntriesMutation, { data, loading, error }] = useUnassignAllEntriesMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useUnassignAllEntriesMutation(baseOptions?: Apollo.MutationHookOptions<UnassignAllEntriesMutation, UnassignAllEntriesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnassignAllEntriesMutation, UnassignAllEntriesMutationVariables>(UnassignAllEntriesDocument, options);
      }
export type UnassignAllEntriesMutationHookResult = ReturnType<typeof useUnassignAllEntriesMutation>;
export type UnassignAllEntriesMutationResult = Apollo.MutationResult<UnassignAllEntriesMutation>;
export type UnassignAllEntriesMutationOptions = Apollo.BaseMutationOptions<UnassignAllEntriesMutation, UnassignAllEntriesMutationVariables>;
export const UnassignEntryDocument = gql`
    mutation UnassignEntry($laneId: String!) {
  unassignEntry(laneId: $laneId) {
    id
    entryId
    heatId
  }
}
    `;
export type UnassignEntryMutationFn = Apollo.MutationFunction<UnassignEntryMutation, UnassignEntryMutationVariables>;

/**
 * __useUnassignEntryMutation__
 *
 * To run a mutation, you first call `useUnassignEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnassignEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unassignEntryMutation, { data, loading, error }] = useUnassignEntryMutation({
 *   variables: {
 *      laneId: // value for 'laneId'
 *   },
 * });
 */
export function useUnassignEntryMutation(baseOptions?: Apollo.MutationHookOptions<UnassignEntryMutation, UnassignEntryMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnassignEntryMutation, UnassignEntryMutationVariables>(UnassignEntryDocument, options);
      }
export type UnassignEntryMutationHookResult = ReturnType<typeof useUnassignEntryMutation>;
export type UnassignEntryMutationResult = Apollo.MutationResult<UnassignEntryMutation>;
export type UnassignEntryMutationOptions = Apollo.BaseMutationOptions<UnassignEntryMutation, UnassignEntryMutationVariables>;
export const UnlinkDirectoryCompFromCompetitionDocument = gql`
    mutation UnlinkDirectoryCompFromCompetition($directoryCompId: String!, $competitionId: String!) {
  unlinkDirectoryCompFromCompetition(
    directoryCompId: $directoryCompId
    competitionId: $competitionId
  )
}
    `;
export type UnlinkDirectoryCompFromCompetitionMutationFn = Apollo.MutationFunction<UnlinkDirectoryCompFromCompetitionMutation, UnlinkDirectoryCompFromCompetitionMutationVariables>;

/**
 * __useUnlinkDirectoryCompFromCompetitionMutation__
 *
 * To run a mutation, you first call `useUnlinkDirectoryCompFromCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnlinkDirectoryCompFromCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unlinkDirectoryCompFromCompetitionMutation, { data, loading, error }] = useUnlinkDirectoryCompFromCompetitionMutation({
 *   variables: {
 *      directoryCompId: // value for 'directoryCompId'
 *      competitionId: // value for 'competitionId'
 *   },
 * });
 */
export function useUnlinkDirectoryCompFromCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<UnlinkDirectoryCompFromCompetitionMutation, UnlinkDirectoryCompFromCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UnlinkDirectoryCompFromCompetitionMutation, UnlinkDirectoryCompFromCompetitionMutationVariables>(UnlinkDirectoryCompFromCompetitionDocument, options);
      }
export type UnlinkDirectoryCompFromCompetitionMutationHookResult = ReturnType<typeof useUnlinkDirectoryCompFromCompetitionMutation>;
export type UnlinkDirectoryCompFromCompetitionMutationResult = Apollo.MutationResult<UnlinkDirectoryCompFromCompetitionMutation>;
export type UnlinkDirectoryCompFromCompetitionMutationOptions = Apollo.BaseMutationOptions<UnlinkDirectoryCompFromCompetitionMutation, UnlinkDirectoryCompFromCompetitionMutationVariables>;
export const UpdateCompetitionDocument = gql`
    mutation UpdateCompetition($id: String!, $name: String, $email: String, $types: [CompetitionType!], $description: String, $startDateTime: DateTime, $endDateTime: DateTime, $venue: String, $street: String, $city: String, $country: String, $postcode: String, $orgName: String, $facebook: String, $instagram: String, $twitter: String, $youtube: String, $timezone: String, $registrationEnabled: Boolean) {
  updateCompetition(
    id: $id
    name: $name
    email: $email
    types: $types
    description: $description
    startDateTime: $startDateTime
    endDateTime: $endDateTime
    venue: $venue
    street: $street
    city: $city
    country: $country
    postcode: $postcode
    orgName: $orgName
    facebook: $facebook
    instagram: $instagram
    twitter: $twitter
    youtube: $youtube
    timezone: $timezone
    registrationEnabled: $registrationEnabled
  ) {
    id
    name
    types
    description
    orgName
    registrationEnabled
    createdAt
    updatedAt
  }
}
    `;
export type UpdateCompetitionMutationFn = Apollo.MutationFunction<UpdateCompetitionMutation, UpdateCompetitionMutationVariables>;

/**
 * __useUpdateCompetitionMutation__
 *
 * To run a mutation, you first call `useUpdateCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCompetitionMutation, { data, loading, error }] = useUpdateCompetitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      email: // value for 'email'
 *      types: // value for 'types'
 *      description: // value for 'description'
 *      startDateTime: // value for 'startDateTime'
 *      endDateTime: // value for 'endDateTime'
 *      venue: // value for 'venue'
 *      street: // value for 'street'
 *      city: // value for 'city'
 *      country: // value for 'country'
 *      postcode: // value for 'postcode'
 *      orgName: // value for 'orgName'
 *      facebook: // value for 'facebook'
 *      instagram: // value for 'instagram'
 *      twitter: // value for 'twitter'
 *      youtube: // value for 'youtube'
 *      timezone: // value for 'timezone'
 *      registrationEnabled: // value for 'registrationEnabled'
 *   },
 * });
 */
export function useUpdateCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateCompetitionMutation, UpdateCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateCompetitionMutation, UpdateCompetitionMutationVariables>(UpdateCompetitionDocument, options);
      }
export type UpdateCompetitionMutationHookResult = ReturnType<typeof useUpdateCompetitionMutation>;
export type UpdateCompetitionMutationResult = Apollo.MutationResult<UpdateCompetitionMutation>;
export type UpdateCompetitionMutationOptions = Apollo.BaseMutationOptions<UpdateCompetitionMutation, UpdateCompetitionMutationVariables>;
export const UpdateDirectoryCompDocument = gql`
    mutation UpdateDirectoryComp($input: UpdateDirectoryCompInput!) {
  updateDirectoryComp(input: $input) {
    id
    title
    location
    country
    price
    currency
    startDate
    endDate
    website
    ticketWebsite
    ctaLink
    email
    logo
    instagramHandle
    categories {
      id
      difficulty
      gender
      teamSize
      isSoldOut
      tags
    }
  }
}
    `;
export type UpdateDirectoryCompMutationFn = Apollo.MutationFunction<UpdateDirectoryCompMutation, UpdateDirectoryCompMutationVariables>;

/**
 * __useUpdateDirectoryCompMutation__
 *
 * To run a mutation, you first call `useUpdateDirectoryCompMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateDirectoryCompMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateDirectoryCompMutation, { data, loading, error }] = useUpdateDirectoryCompMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateDirectoryCompMutation(baseOptions?: Apollo.MutationHookOptions<UpdateDirectoryCompMutation, UpdateDirectoryCompMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateDirectoryCompMutation, UpdateDirectoryCompMutationVariables>(UpdateDirectoryCompDocument, options);
      }
export type UpdateDirectoryCompMutationHookResult = ReturnType<typeof useUpdateDirectoryCompMutation>;
export type UpdateDirectoryCompMutationResult = Apollo.MutationResult<UpdateDirectoryCompMutation>;
export type UpdateDirectoryCompMutationOptions = Apollo.BaseMutationOptions<UpdateDirectoryCompMutation, UpdateDirectoryCompMutationVariables>;
export const UpdateEarlyBirdDocument = gql`
    mutation UpdateEarlyBird($earlyBird: EarlyBirdInput!) {
  updateEarlyBird(earlyBird: $earlyBird) {
    id
  }
}
    `;
export type UpdateEarlyBirdMutationFn = Apollo.MutationFunction<UpdateEarlyBirdMutation, UpdateEarlyBirdMutationVariables>;

/**
 * __useUpdateEarlyBirdMutation__
 *
 * To run a mutation, you first call `useUpdateEarlyBirdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEarlyBirdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEarlyBirdMutation, { data, loading, error }] = useUpdateEarlyBirdMutation({
 *   variables: {
 *      earlyBird: // value for 'earlyBird'
 *   },
 * });
 */
export function useUpdateEarlyBirdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateEarlyBirdMutation, UpdateEarlyBirdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateEarlyBirdMutation, UpdateEarlyBirdMutationVariables>(UpdateEarlyBirdDocument, options);
      }
export type UpdateEarlyBirdMutationHookResult = ReturnType<typeof useUpdateEarlyBirdMutation>;
export type UpdateEarlyBirdMutationResult = Apollo.MutationResult<UpdateEarlyBirdMutation>;
export type UpdateEarlyBirdMutationOptions = Apollo.BaseMutationOptions<UpdateEarlyBirdMutation, UpdateEarlyBirdMutationVariables>;
export const UpdateHeatDocument = gql`
    mutation UpdateHeat($id: String!, $startTime: DateTime, $ticketTypeIds: [String!], $maxLimitPerHeat: Int) {
  updateHeat(
    id: $id
    startTime: $startTime
    ticketTypeIds: $ticketTypeIds
    maxLimitPerHeat: $maxLimitPerHeat
  ) {
    id
    startTime
    workoutId
  }
}
    `;
export type UpdateHeatMutationFn = Apollo.MutationFunction<UpdateHeatMutation, UpdateHeatMutationVariables>;

/**
 * __useUpdateHeatMutation__
 *
 * To run a mutation, you first call `useUpdateHeatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHeatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHeatMutation, { data, loading, error }] = useUpdateHeatMutation({
 *   variables: {
 *      id: // value for 'id'
 *      startTime: // value for 'startTime'
 *      ticketTypeIds: // value for 'ticketTypeIds'
 *      maxLimitPerHeat: // value for 'maxLimitPerHeat'
 *   },
 * });
 */
export function useUpdateHeatMutation(baseOptions?: Apollo.MutationHookOptions<UpdateHeatMutation, UpdateHeatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateHeatMutation, UpdateHeatMutationVariables>(UpdateHeatDocument, options);
      }
export type UpdateHeatMutationHookResult = ReturnType<typeof useUpdateHeatMutation>;
export type UpdateHeatMutationResult = Apollo.MutationResult<UpdateHeatMutation>;
export type UpdateHeatMutationOptions = Apollo.BaseMutationOptions<UpdateHeatMutation, UpdateHeatMutationVariables>;
export const UpdateHeatLimitsDocument = gql`
    mutation UpdateHeatLimits($input: [UpdateHeatLimitsInput!]!) {
  updateHeatLimits(input: $input) {
    id
    maxLimitPerHeat
    name
  }
}
    `;
export type UpdateHeatLimitsMutationFn = Apollo.MutationFunction<UpdateHeatLimitsMutation, UpdateHeatLimitsMutationVariables>;

/**
 * __useUpdateHeatLimitsMutation__
 *
 * To run a mutation, you first call `useUpdateHeatLimitsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateHeatLimitsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateHeatLimitsMutation, { data, loading, error }] = useUpdateHeatLimitsMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateHeatLimitsMutation(baseOptions?: Apollo.MutationHookOptions<UpdateHeatLimitsMutation, UpdateHeatLimitsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateHeatLimitsMutation, UpdateHeatLimitsMutationVariables>(UpdateHeatLimitsDocument, options);
      }
export type UpdateHeatLimitsMutationHookResult = ReturnType<typeof useUpdateHeatLimitsMutation>;
export type UpdateHeatLimitsMutationResult = Apollo.MutationResult<UpdateHeatLimitsMutation>;
export type UpdateHeatLimitsMutationOptions = Apollo.BaseMutationOptions<UpdateHeatLimitsMutation, UpdateHeatLimitsMutationVariables>;
export const UpdateInvitationDocument = gql`
    mutation UpdateInvitation($id: String!, $email: String!) {
  updateInvitation(id: $id, email: $email) {
    id
    email
    updatedAt
  }
}
    `;
export type UpdateInvitationMutationFn = Apollo.MutationFunction<UpdateInvitationMutation, UpdateInvitationMutationVariables>;

/**
 * __useUpdateInvitationMutation__
 *
 * To run a mutation, you first call `useUpdateInvitationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateInvitationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateInvitationMutation, { data, loading, error }] = useUpdateInvitationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useUpdateInvitationMutation(baseOptions?: Apollo.MutationHookOptions<UpdateInvitationMutation, UpdateInvitationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateInvitationMutation, UpdateInvitationMutationVariables>(UpdateInvitationDocument, options);
      }
export type UpdateInvitationMutationHookResult = ReturnType<typeof useUpdateInvitationMutation>;
export type UpdateInvitationMutationResult = Apollo.MutationResult<UpdateInvitationMutation>;
export type UpdateInvitationMutationOptions = Apollo.BaseMutationOptions<UpdateInvitationMutation, UpdateInvitationMutationVariables>;
export const UpdateLaneHeatDocument = gql`
    mutation UpdateLaneHeat($id: String!, $heatId: String!) {
  updateLaneHeat(id: $id, heatId: $heatId) {
    id
    number
    entryId
    heatId
    createdAt
    updatedAt
  }
}
    `;
export type UpdateLaneHeatMutationFn = Apollo.MutationFunction<UpdateLaneHeatMutation, UpdateLaneHeatMutationVariables>;

/**
 * __useUpdateLaneHeatMutation__
 *
 * To run a mutation, you first call `useUpdateLaneHeatMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLaneHeatMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLaneHeatMutation, { data, loading, error }] = useUpdateLaneHeatMutation({
 *   variables: {
 *      id: // value for 'id'
 *      heatId: // value for 'heatId'
 *   },
 * });
 */
export function useUpdateLaneHeatMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLaneHeatMutation, UpdateLaneHeatMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLaneHeatMutation, UpdateLaneHeatMutationVariables>(UpdateLaneHeatDocument, options);
      }
export type UpdateLaneHeatMutationHookResult = ReturnType<typeof useUpdateLaneHeatMutation>;
export type UpdateLaneHeatMutationResult = Apollo.MutationResult<UpdateLaneHeatMutation>;
export type UpdateLaneHeatMutationOptions = Apollo.BaseMutationOptions<UpdateLaneHeatMutation, UpdateLaneHeatMutationVariables>;
export const UpdateLaneOrderDocument = gql`
    mutation UpdateLaneOrder($laneId: String!, $newPosition: Int!) {
  updateLaneOrder(laneId: $laneId, newPosition: $newPosition) {
    id
    number
    entryId
    heatId
    createdAt
    updatedAt
  }
}
    `;
export type UpdateLaneOrderMutationFn = Apollo.MutationFunction<UpdateLaneOrderMutation, UpdateLaneOrderMutationVariables>;

/**
 * __useUpdateLaneOrderMutation__
 *
 * To run a mutation, you first call `useUpdateLaneOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateLaneOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateLaneOrderMutation, { data, loading, error }] = useUpdateLaneOrderMutation({
 *   variables: {
 *      laneId: // value for 'laneId'
 *      newPosition: // value for 'newPosition'
 *   },
 * });
 */
export function useUpdateLaneOrderMutation(baseOptions?: Apollo.MutationHookOptions<UpdateLaneOrderMutation, UpdateLaneOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateLaneOrderMutation, UpdateLaneOrderMutationVariables>(UpdateLaneOrderDocument, options);
      }
export type UpdateLaneOrderMutationHookResult = ReturnType<typeof useUpdateLaneOrderMutation>;
export type UpdateLaneOrderMutationResult = Apollo.MutationResult<UpdateLaneOrderMutation>;
export type UpdateLaneOrderMutationOptions = Apollo.BaseMutationOptions<UpdateLaneOrderMutation, UpdateLaneOrderMutationVariables>;
export const UpdateNotificationSubscriptionDocument = gql`
    mutation UpdateNotificationSubscription($input: UpdateNotificationSubscriptionInput!) {
  updateNotificationSubscription(input: $input) {
    id
    email
    eventType
    countries
    locations
    tags
  }
}
    `;
export type UpdateNotificationSubscriptionMutationFn = Apollo.MutationFunction<UpdateNotificationSubscriptionMutation, UpdateNotificationSubscriptionMutationVariables>;

/**
 * __useUpdateNotificationSubscriptionMutation__
 *
 * To run a mutation, you first call `useUpdateNotificationSubscriptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateNotificationSubscriptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateNotificationSubscriptionMutation, { data, loading, error }] = useUpdateNotificationSubscriptionMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateNotificationSubscriptionMutation(baseOptions?: Apollo.MutationHookOptions<UpdateNotificationSubscriptionMutation, UpdateNotificationSubscriptionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateNotificationSubscriptionMutation, UpdateNotificationSubscriptionMutationVariables>(UpdateNotificationSubscriptionDocument, options);
      }
export type UpdateNotificationSubscriptionMutationHookResult = ReturnType<typeof useUpdateNotificationSubscriptionMutation>;
export type UpdateNotificationSubscriptionMutationResult = Apollo.MutationResult<UpdateNotificationSubscriptionMutation>;
export type UpdateNotificationSubscriptionMutationOptions = Apollo.BaseMutationOptions<UpdateNotificationSubscriptionMutation, UpdateNotificationSubscriptionMutationVariables>;
export const UpdatePartnerInterestDocument = gql`
    mutation UpdatePartnerInterest($id: String!, $categoryId: String, $ticketTypeId: String, $description: String, $phone: String) {
  updatePartnerInterest(
    id: $id
    categoryId: $categoryId
    ticketTypeId: $ticketTypeId
    description: $description
    phone: $phone
  ) {
    id
    userId
    interestType
    partnerPreference
    categoryId
    ticketTypeId
    description
    status
    createdAt
    updatedAt
    user {
      id
      firstName
      lastName
      picture
    }
    category {
      id
      difficulty
      gender
      teamSize
      isSoldOut
      tags
    }
  }
}
    `;
export type UpdatePartnerInterestMutationFn = Apollo.MutationFunction<UpdatePartnerInterestMutation, UpdatePartnerInterestMutationVariables>;

/**
 * __useUpdatePartnerInterestMutation__
 *
 * To run a mutation, you first call `useUpdatePartnerInterestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePartnerInterestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePartnerInterestMutation, { data, loading, error }] = useUpdatePartnerInterestMutation({
 *   variables: {
 *      id: // value for 'id'
 *      categoryId: // value for 'categoryId'
 *      ticketTypeId: // value for 'ticketTypeId'
 *      description: // value for 'description'
 *      phone: // value for 'phone'
 *   },
 * });
 */
export function useUpdatePartnerInterestMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePartnerInterestMutation, UpdatePartnerInterestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePartnerInterestMutation, UpdatePartnerInterestMutationVariables>(UpdatePartnerInterestDocument, options);
      }
export type UpdatePartnerInterestMutationHookResult = ReturnType<typeof useUpdatePartnerInterestMutation>;
export type UpdatePartnerInterestMutationResult = Apollo.MutationResult<UpdatePartnerInterestMutation>;
export type UpdatePartnerInterestMutationOptions = Apollo.BaseMutationOptions<UpdatePartnerInterestMutation, UpdatePartnerInterestMutationVariables>;
export const UpdatePartnerRequestDocument = gql`
    mutation UpdatePartnerRequest($input: UpdatePartnerRequestInput!) {
  updatePartnerRequest(input: $input) {
    id
    fromInterestId
    fromUserId
    toInterestId
    message
    status
    createdAt
    updatedAt
    fromUser {
      id
      name
      picture
    }
    fromInterest {
      id
      userId
    }
    toInterest {
      id
      userId
    }
  }
}
    `;
export type UpdatePartnerRequestMutationFn = Apollo.MutationFunction<UpdatePartnerRequestMutation, UpdatePartnerRequestMutationVariables>;

/**
 * __useUpdatePartnerRequestMutation__
 *
 * To run a mutation, you first call `useUpdatePartnerRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePartnerRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePartnerRequestMutation, { data, loading, error }] = useUpdatePartnerRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdatePartnerRequestMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePartnerRequestMutation, UpdatePartnerRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePartnerRequestMutation, UpdatePartnerRequestMutationVariables>(UpdatePartnerRequestDocument, options);
      }
export type UpdatePartnerRequestMutationHookResult = ReturnType<typeof useUpdatePartnerRequestMutation>;
export type UpdatePartnerRequestMutationResult = Apollo.MutationResult<UpdatePartnerRequestMutation>;
export type UpdatePartnerRequestMutationOptions = Apollo.BaseMutationOptions<UpdatePartnerRequestMutation, UpdatePartnerRequestMutationVariables>;
export const UpdatePotentialCompetitionDocument = gql`
    mutation UpdatePotentialCompetition($id: String!, $name: String, $description: String, $startDateTime: DateTime, $endDateTime: DateTime, $website: String, $email: String, $instagramHandle: String, $price: Float, $currency: String, $country: String, $state: String, $region: String, $venue: String, $city: String) {
  updatePotentialCompetition(
    id: $id
    name: $name
    description: $description
    startDateTime: $startDateTime
    endDateTime: $endDateTime
    website: $website
    email: $email
    instagramHandle: $instagramHandle
    price: $price
    currency: $currency
    country: $country
    state: $state
    region: $region
    venue: $venue
    city: $city
  )
}
    `;
export type UpdatePotentialCompetitionMutationFn = Apollo.MutationFunction<UpdatePotentialCompetitionMutation, UpdatePotentialCompetitionMutationVariables>;

/**
 * __useUpdatePotentialCompetitionMutation__
 *
 * To run a mutation, you first call `useUpdatePotentialCompetitionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePotentialCompetitionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePotentialCompetitionMutation, { data, loading, error }] = useUpdatePotentialCompetitionMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *      description: // value for 'description'
 *      startDateTime: // value for 'startDateTime'
 *      endDateTime: // value for 'endDateTime'
 *      website: // value for 'website'
 *      email: // value for 'email'
 *      instagramHandle: // value for 'instagramHandle'
 *      price: // value for 'price'
 *      currency: // value for 'currency'
 *      country: // value for 'country'
 *      state: // value for 'state'
 *      region: // value for 'region'
 *      venue: // value for 'venue'
 *      city: // value for 'city'
 *   },
 * });
 */
export function useUpdatePotentialCompetitionMutation(baseOptions?: Apollo.MutationHookOptions<UpdatePotentialCompetitionMutation, UpdatePotentialCompetitionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdatePotentialCompetitionMutation, UpdatePotentialCompetitionMutationVariables>(UpdatePotentialCompetitionDocument, options);
      }
export type UpdatePotentialCompetitionMutationHookResult = ReturnType<typeof useUpdatePotentialCompetitionMutation>;
export type UpdatePotentialCompetitionMutationResult = Apollo.MutationResult<UpdatePotentialCompetitionMutation>;
export type UpdatePotentialCompetitionMutationOptions = Apollo.BaseMutationOptions<UpdatePotentialCompetitionMutation, UpdatePotentialCompetitionMutationVariables>;
export const UpdateRegistrationFieldDocument = gql`
    mutation UpdateRegistrationField($id: String!, $question: String, $type: QuestionType, $requiredStatus: RequiredStatus, $options: [String], $repeatPerAthlete: Boolean, $ticketTypeIds: [String!]) {
  updateRegistrationField(
    id: $id
    question: $question
    type: $type
    requiredStatus: $requiredStatus
    options: $options
    repeatPerAthlete: $repeatPerAthlete
    ticketTypeIds: $ticketTypeIds
  ) {
    id
    question
    type
    requiredStatus
    options
    repeatPerAthlete
  }
}
    `;
export type UpdateRegistrationFieldMutationFn = Apollo.MutationFunction<UpdateRegistrationFieldMutation, UpdateRegistrationFieldMutationVariables>;

/**
 * __useUpdateRegistrationFieldMutation__
 *
 * To run a mutation, you first call `useUpdateRegistrationFieldMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateRegistrationFieldMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateRegistrationFieldMutation, { data, loading, error }] = useUpdateRegistrationFieldMutation({
 *   variables: {
 *      id: // value for 'id'
 *      question: // value for 'question'
 *      type: // value for 'type'
 *      requiredStatus: // value for 'requiredStatus'
 *      options: // value for 'options'
 *      repeatPerAthlete: // value for 'repeatPerAthlete'
 *      ticketTypeIds: // value for 'ticketTypeIds'
 *   },
 * });
 */
export function useUpdateRegistrationFieldMutation(baseOptions?: Apollo.MutationHookOptions<UpdateRegistrationFieldMutation, UpdateRegistrationFieldMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateRegistrationFieldMutation, UpdateRegistrationFieldMutationVariables>(UpdateRegistrationFieldDocument, options);
      }
export type UpdateRegistrationFieldMutationHookResult = ReturnType<typeof useUpdateRegistrationFieldMutation>;
export type UpdateRegistrationFieldMutationResult = Apollo.MutationResult<UpdateRegistrationFieldMutation>;
export type UpdateRegistrationFieldMutationOptions = Apollo.BaseMutationOptions<UpdateRegistrationFieldMutation, UpdateRegistrationFieldMutationVariables>;
export const UpdateScoreByIdDocument = gql`
    mutation UpdateScoreById($id: String!, $value: String!, $isCompleted: Boolean!, $scorecard: String, $note: String) {
  updateScoreById(
    id: $id
    value: $value
    isCompleted: $isCompleted
    scorecard: $scorecard
    note: $note
  ) {
    id
    value
    isCompleted
    scorecard
    note
    createdAt
    updatedAt
  }
}
    `;
export type UpdateScoreByIdMutationFn = Apollo.MutationFunction<UpdateScoreByIdMutation, UpdateScoreByIdMutationVariables>;

/**
 * __useUpdateScoreByIdMutation__
 *
 * To run a mutation, you first call `useUpdateScoreByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateScoreByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateScoreByIdMutation, { data, loading, error }] = useUpdateScoreByIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *      value: // value for 'value'
 *      isCompleted: // value for 'isCompleted'
 *      scorecard: // value for 'scorecard'
 *      note: // value for 'note'
 *   },
 * });
 */
export function useUpdateScoreByIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateScoreByIdMutation, UpdateScoreByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateScoreByIdMutation, UpdateScoreByIdMutationVariables>(UpdateScoreByIdDocument, options);
      }
export type UpdateScoreByIdMutationHookResult = ReturnType<typeof useUpdateScoreByIdMutation>;
export type UpdateScoreByIdMutationResult = Apollo.MutationResult<UpdateScoreByIdMutation>;
export type UpdateScoreByIdMutationOptions = Apollo.BaseMutationOptions<UpdateScoreByIdMutation, UpdateScoreByIdMutationVariables>;
export const UpdateTeamDocument = gql`
    mutation UpdateTeam($id: String!, $name: String!) {
  updateTeam(id: $id, name: $name) {
    id
    name
  }
}
    `;
export type UpdateTeamMutationFn = Apollo.MutationFunction<UpdateTeamMutation, UpdateTeamMutationVariables>;

/**
 * __useUpdateTeamMutation__
 *
 * To run a mutation, you first call `useUpdateTeamMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTeamMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTeamMutation, { data, loading, error }] = useUpdateTeamMutation({
 *   variables: {
 *      id: // value for 'id'
 *      name: // value for 'name'
 *   },
 * });
 */
export function useUpdateTeamMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTeamMutation, UpdateTeamMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTeamMutation, UpdateTeamMutationVariables>(UpdateTeamDocument, options);
      }
export type UpdateTeamMutationHookResult = ReturnType<typeof useUpdateTeamMutation>;
export type UpdateTeamMutationResult = Apollo.MutationResult<UpdateTeamMutation>;
export type UpdateTeamMutationOptions = Apollo.BaseMutationOptions<UpdateTeamMutation, UpdateTeamMutationVariables>;
export const UpdateTicketTypeDocument = gql`
    mutation UpdateTicketType($input: UpdateTicketTypeInput!) {
  updateTicketType(input: $input) {
    id
    name
  }
}
    `;
export type UpdateTicketTypeMutationFn = Apollo.MutationFunction<UpdateTicketTypeMutation, UpdateTicketTypeMutationVariables>;

/**
 * __useUpdateTicketTypeMutation__
 *
 * To run a mutation, you first call `useUpdateTicketTypeMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateTicketTypeMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateTicketTypeMutation, { data, loading, error }] = useUpdateTicketTypeMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateTicketTypeMutation(baseOptions?: Apollo.MutationHookOptions<UpdateTicketTypeMutation, UpdateTicketTypeMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateTicketTypeMutation, UpdateTicketTypeMutationVariables>(UpdateTicketTypeDocument, options);
      }
export type UpdateTicketTypeMutationHookResult = ReturnType<typeof useUpdateTicketTypeMutation>;
export type UpdateTicketTypeMutationResult = Apollo.MutationResult<UpdateTicketTypeMutation>;
export type UpdateTicketTypeMutationOptions = Apollo.BaseMutationOptions<UpdateTicketTypeMutation, UpdateTicketTypeMutationVariables>;
export const UpdateUserDocument = gql`
    mutation UpdateUser($firstName: String, $lastName: String) {
  updateUser(firstName: $firstName, lastName: $lastName) {
    id
    email
    firstName
    lastName
    picture
    bio
    isSuperUser
    isVerified
  }
}
    `;
export type UpdateUserMutationFn = Apollo.MutationFunction<UpdateUserMutation, UpdateUserMutationVariables>;

/**
 * __useUpdateUserMutation__
 *
 * To run a mutation, you first call `useUpdateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserMutation, { data, loading, error }] = useUpdateUserMutation({
 *   variables: {
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *   },
 * });
 */
export function useUpdateUserMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserMutation, UpdateUserMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserMutation, UpdateUserMutationVariables>(UpdateUserDocument, options);
      }
export type UpdateUserMutationHookResult = ReturnType<typeof useUpdateUserMutation>;
export type UpdateUserMutationResult = Apollo.MutationResult<UpdateUserMutation>;
export type UpdateUserMutationOptions = Apollo.BaseMutationOptions<UpdateUserMutation, UpdateUserMutationVariables>;
export const UpdateUserBioDocument = gql`
    mutation UpdateUserBio($bio: String!) {
  updateUserBio(bio: $bio) {
    id
    email
    firstName
    lastName
    picture
    bio
    isSuperUser
    isVerified
    createdAt
    updatedAt
  }
}
    `;
export type UpdateUserBioMutationFn = Apollo.MutationFunction<UpdateUserBioMutation, UpdateUserBioMutationVariables>;

/**
 * __useUpdateUserBioMutation__
 *
 * To run a mutation, you first call `useUpdateUserBioMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserBioMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserBioMutation, { data, loading, error }] = useUpdateUserBioMutation({
 *   variables: {
 *      bio: // value for 'bio'
 *   },
 * });
 */
export function useUpdateUserBioMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserBioMutation, UpdateUserBioMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserBioMutation, UpdateUserBioMutationVariables>(UpdateUserBioDocument, options);
      }
export type UpdateUserBioMutationHookResult = ReturnType<typeof useUpdateUserBioMutation>;
export type UpdateUserBioMutationResult = Apollo.MutationResult<UpdateUserBioMutation>;
export type UpdateUserBioMutationOptions = Apollo.BaseMutationOptions<UpdateUserBioMutation, UpdateUserBioMutationVariables>;
export const UpdateUserByIdDocument = gql`
    mutation UpdateUserById($userId: String!, $competitionId: String!, $firstName: String, $lastName: String) {
  updateUserById(
    userId: $userId
    competitionId: $competitionId
    firstName: $firstName
    lastName: $lastName
  ) {
    id
    email
    firstName
    lastName
    name
  }
}
    `;
export type UpdateUserByIdMutationFn = Apollo.MutationFunction<UpdateUserByIdMutation, UpdateUserByIdMutationVariables>;

/**
 * __useUpdateUserByIdMutation__
 *
 * To run a mutation, you first call `useUpdateUserByIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserByIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserByIdMutation, { data, loading, error }] = useUpdateUserByIdMutation({
 *   variables: {
 *      userId: // value for 'userId'
 *      competitionId: // value for 'competitionId'
 *      firstName: // value for 'firstName'
 *      lastName: // value for 'lastName'
 *   },
 * });
 */
export function useUpdateUserByIdMutation(baseOptions?: Apollo.MutationHookOptions<UpdateUserByIdMutation, UpdateUserByIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateUserByIdMutation, UpdateUserByIdMutationVariables>(UpdateUserByIdDocument, options);
      }
export type UpdateUserByIdMutationHookResult = ReturnType<typeof useUpdateUserByIdMutation>;
export type UpdateUserByIdMutationResult = Apollo.MutationResult<UpdateUserByIdMutation>;
export type UpdateUserByIdMutationOptions = Apollo.BaseMutationOptions<UpdateUserByIdMutation, UpdateUserByIdMutationVariables>;
export const UpdateWorkoutDocument = gql`
    mutation UpdateWorkout($id: String!, $input: UpdateWorkoutInput!) {
  updateWorkout(id: $id, input: $input) {
    id
    name
    description
    releaseDateTime
    competitionId
    location
    scoreType
    unitOfMeasurement
    timeCap
    includeStandardsVideo
    createdAt
    updatedAt
    videos {
      id
      title
      description
      url
      orderIndex
    }
  }
}
    `;
export type UpdateWorkoutMutationFn = Apollo.MutationFunction<UpdateWorkoutMutation, UpdateWorkoutMutationVariables>;

/**
 * __useUpdateWorkoutMutation__
 *
 * To run a mutation, you first call `useUpdateWorkoutMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkoutMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkoutMutation, { data, loading, error }] = useUpdateWorkoutMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateWorkoutMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkoutMutation, UpdateWorkoutMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkoutMutation, UpdateWorkoutMutationVariables>(UpdateWorkoutDocument, options);
      }
export type UpdateWorkoutMutationHookResult = ReturnType<typeof useUpdateWorkoutMutation>;
export type UpdateWorkoutMutationResult = Apollo.MutationResult<UpdateWorkoutMutation>;
export type UpdateWorkoutMutationOptions = Apollo.BaseMutationOptions<UpdateWorkoutMutation, UpdateWorkoutMutationVariables>;
export const UpdateWorkoutVisibilityDocument = gql`
    mutation UpdateWorkoutVisibility($id: String!, $isVisible: Boolean!) {
  updateWorkoutVisibility(id: $id, isVisible: $isVisible) {
    id
    name
    isVisible
  }
}
    `;
export type UpdateWorkoutVisibilityMutationFn = Apollo.MutationFunction<UpdateWorkoutVisibilityMutation, UpdateWorkoutVisibilityMutationVariables>;

/**
 * __useUpdateWorkoutVisibilityMutation__
 *
 * To run a mutation, you first call `useUpdateWorkoutVisibilityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateWorkoutVisibilityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateWorkoutVisibilityMutation, { data, loading, error }] = useUpdateWorkoutVisibilityMutation({
 *   variables: {
 *      id: // value for 'id'
 *      isVisible: // value for 'isVisible'
 *   },
 * });
 */
export function useUpdateWorkoutVisibilityMutation(baseOptions?: Apollo.MutationHookOptions<UpdateWorkoutVisibilityMutation, UpdateWorkoutVisibilityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UpdateWorkoutVisibilityMutation, UpdateWorkoutVisibilityMutationVariables>(UpdateWorkoutVisibilityDocument, options);
      }
export type UpdateWorkoutVisibilityMutationHookResult = ReturnType<typeof useUpdateWorkoutVisibilityMutation>;
export type UpdateWorkoutVisibilityMutationResult = Apollo.MutationResult<UpdateWorkoutVisibilityMutation>;
export type UpdateWorkoutVisibilityMutationOptions = Apollo.BaseMutationOptions<UpdateWorkoutVisibilityMutation, UpdateWorkoutVisibilityMutationVariables>;
export const UploadCompetitionLogoDocument = gql`
    mutation UploadCompetitionLogo($competitionId: String!, $image: String!) {
  uploadCompetitionLogo(competitionId: $competitionId, image: $image) {
    id
    name
    logo
  }
}
    `;
export type UploadCompetitionLogoMutationFn = Apollo.MutationFunction<UploadCompetitionLogoMutation, UploadCompetitionLogoMutationVariables>;

/**
 * __useUploadCompetitionLogoMutation__
 *
 * To run a mutation, you first call `useUploadCompetitionLogoMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadCompetitionLogoMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadCompetitionLogoMutation, { data, loading, error }] = useUploadCompetitionLogoMutation({
 *   variables: {
 *      competitionId: // value for 'competitionId'
 *      image: // value for 'image'
 *   },
 * });
 */
export function useUploadCompetitionLogoMutation(baseOptions?: Apollo.MutationHookOptions<UploadCompetitionLogoMutation, UploadCompetitionLogoMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadCompetitionLogoMutation, UploadCompetitionLogoMutationVariables>(UploadCompetitionLogoDocument, options);
      }
export type UploadCompetitionLogoMutationHookResult = ReturnType<typeof useUploadCompetitionLogoMutation>;
export type UploadCompetitionLogoMutationResult = Apollo.MutationResult<UploadCompetitionLogoMutation>;
export type UploadCompetitionLogoMutationOptions = Apollo.BaseMutationOptions<UploadCompetitionLogoMutation, UploadCompetitionLogoMutationVariables>;
export const UploadOrgImageDocument = gql`
    mutation UploadOrgImage($orgId: String!, $image: String!) {
  uploadOrgImage(orgId: $orgId, image: $image) {
    id
    name
  }
}
    `;
export type UploadOrgImageMutationFn = Apollo.MutationFunction<UploadOrgImageMutation, UploadOrgImageMutationVariables>;

/**
 * __useUploadOrgImageMutation__
 *
 * To run a mutation, you first call `useUploadOrgImageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadOrgImageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadOrgImageMutation, { data, loading, error }] = useUploadOrgImageMutation({
 *   variables: {
 *      orgId: // value for 'orgId'
 *      image: // value for 'image'
 *   },
 * });
 */
export function useUploadOrgImageMutation(baseOptions?: Apollo.MutationHookOptions<UploadOrgImageMutation, UploadOrgImageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadOrgImageMutation, UploadOrgImageMutationVariables>(UploadOrgImageDocument, options);
      }
export type UploadOrgImageMutationHookResult = ReturnType<typeof useUploadOrgImageMutation>;
export type UploadOrgImageMutationResult = Apollo.MutationResult<UploadOrgImageMutation>;
export type UploadOrgImageMutationOptions = Apollo.BaseMutationOptions<UploadOrgImageMutation, UploadOrgImageMutationVariables>;
export const UploadUserAvatarDocument = gql`
    mutation UploadUserAvatar($image: String!) {
  uploadUserAvatar(image: $image) {
    id
    firstName
    lastName
    email
    isSuperUser
    isVerified
    picture
    bio
    createdAt
    updatedAt
    invitationId
    referredBy
    referralCode
    orgId
  }
}
    `;
export type UploadUserAvatarMutationFn = Apollo.MutationFunction<UploadUserAvatarMutation, UploadUserAvatarMutationVariables>;

/**
 * __useUploadUserAvatarMutation__
 *
 * To run a mutation, you first call `useUploadUserAvatarMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUploadUserAvatarMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [uploadUserAvatarMutation, { data, loading, error }] = useUploadUserAvatarMutation({
 *   variables: {
 *      image: // value for 'image'
 *   },
 * });
 */
export function useUploadUserAvatarMutation(baseOptions?: Apollo.MutationHookOptions<UploadUserAvatarMutation, UploadUserAvatarMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<UploadUserAvatarMutation, UploadUserAvatarMutationVariables>(UploadUserAvatarDocument, options);
      }
export type UploadUserAvatarMutationHookResult = ReturnType<typeof useUploadUserAvatarMutation>;
export type UploadUserAvatarMutationResult = Apollo.MutationResult<UploadUserAvatarMutation>;
export type UploadUserAvatarMutationOptions = Apollo.BaseMutationOptions<UploadUserAvatarMutation, UploadUserAvatarMutationVariables>;