export type EventType = 'wedding' | 'birthday' | 'community' | 'anniversary' | 'festival' | 'corporate';

export interface EventInput {
  name: string;
  type: EventType;
  date: string; // YYYY-MM-DD
  location: string;
  guestCount: number;
  budgetINR: number;
  theme: string;
  preferences: string;
}

export interface ColorSwatch {
  name: string;
  hex: string;
  usage: string;
}

export interface BudgetItem {
  id: string;
  category: string;
  percentage: number;
  allocatedAmountINR: number;
  actualSpentINR: number;
  rationale: string;
  notes?: string;
}

export interface MilestoneItem {
  id: string;
  daysBeforeEvent: number;
  dueDate: string; // YYYY-MM-DD
  milestoneTitle: string;
  description: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  completed: boolean;
}

export type VendorStatus = 'Not Contacted' | 'In Discussion' | 'Quote Received' | 'Booked' | 'Completed';

export interface VendorItem {
  id: string;
  category: string;
  serviceTitle: string;
  vendorName: string;
  contactPerson: string;
  phoneOrEmail: string;
  estimatedCostINR: number;
  finalCostINR: number;
  status: VendorStatus;
  suggestedQuestions: string[];
  notes?: string;
  completed: boolean;
}

export interface EventPlan {
  id: string;
  input: EventInput;
  conceptAndTheme: {
    title: string;
    tagline: string;
    description: string;
    aestheticVibe: string;
  };
  decorationAndColorPalette: {
    primaryColors: ColorSwatch[];
    decorElements: string[];
    lightingStyle: string;
    flowerSuggestions: string[];
  };
  venueAndCatering: {
    venueTypes: string[];
    seatingLayout: string;
    cateringStyle: string;
    signatureDishes: string[];
    beverageIdeas: string[];
  };
  activitiesAndEntertainment: Array<{
    id: string;
    title: string;
    description: string;
    timeSlot: string;
    targetAudience: string;
  }>;
  moneySavingIdeas: Array<{
    tip: string;
    estimatedSavings: string;
    tradeOff: string;
  }>;
  budgetEstimates: BudgetItem[];
  planningMilestones: MilestoneItem[];
  vendorChecklist: VendorItem[];
  risksAndPracticalTips: Array<{
    risk: string;
    mitigation: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AssistantMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
