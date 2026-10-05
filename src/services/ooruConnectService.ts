// Central Unified Backend Business Logic for OoruConnect
// "Same Service, Different Interaction. One Backend."

export interface ServiceContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  village: string;
  type: 'provider' | 'fos' | 'office' | 'coordinator';
  avatarUrl?: string;
  contextDescription: string;
}

export interface VoiceIntentResult {
  rawSpeech: string;
  detectedIntent: 'CREATE_LABOUR_REQUEST' | 'CREATE_TECHNICIAN_REQUEST' | 'UPDATE_AVAILABILITY' | 'FIND_WORKERS' | 'UNKNOWN';
  entities: {
    workType?: string;
    workerCount?: number;
    urgency?: 'normal' | 'urgent';
    date?: string;
    village?: string;
    serviceType?: string;
    status?: 'available_today' | 'available_date' | 'booked';
  };
  confirmationTextTa: string;
  confirmationTextEn: string;
  requiresConfirmation: boolean;
}

export interface IVRResponse {
  menuKey: string;
  actionTaken: string;
  voicePromptTa: string;
  voicePromptEn: string;
  nextStep: number;
}

export interface VLinkSyncReceipt {
  eventId: string;
  status: 'QUEUED' | 'RELAYED' | 'GATEWAY_RECEIVED' | 'CLOUD_SYNCED';
  timestamp: string;
  retryCount: number;
}

class OoruConnectBackendService {
  // Comprehensive Contact Matrix by Service Domain
  private mockContacts: Record<string, ServiceContact> = {
    labor: {
      id: 'cont_labor',
      name: 'ரவி மேஸ்திரி (Ravi Maistry)',
      role: 'Harvesting & Labour Squad Lead (12 workers)',
      phone: '9842100111',
      village: 'Vadugapalayam',
      type: 'provider',
      contextDescription: 'அறுவடை மற்றும் ஆட்கள் தேவைக்கான மேஸ்திரி',
    },
    equipment: {
      id: 'cont_equip',
      name: 'முருகன் JCB & Tractor Service',
      role: 'Heavy Machinery & Equipment Operator',
      phone: '9842100444',
      village: 'Sulur Cluster',
      type: 'provider',
      contextDescription: 'டிராக்டர் & JCB இயந்திர சேவை நிபுணர்',
    },
    technician: {
      id: 'cont_tech',
      name: 'குமார் மோட்டார் ஒர்க்ஸ் (Kumar Mechanic)',
      role: 'Pump, Motor & Electrical Technician',
      phone: '9842100333',
      village: 'Pollachi Rural',
      type: 'provider',
      contextDescription: 'மோட்டார் & எலக்ட்ரிக்கல் பழுதுநீக்கும் நிபுணர்',
    },
    fpo: {
      id: 'cont_fpo',
      name: 'தாராபுரம் விவசாயிகள் சங்கம் (FPO Center)',
      role: 'Market Price & Crop Buyer Coordinator',
      phone: '9842100777',
      village: 'Dharapuram Hub',
      type: 'coordinator',
      contextDescription: 'சந்தை விலை & விளைபொருள் கொள்முதல் மையம்',
    },
    storage: {
      id: 'cont_storage',
      name: 'கோயம்புத்தூர் குளிர்பதன கிடங்கு (Cold Storage)',
      role: 'Warehouse & Cold Storage Manager',
      phone: '9842100888',
      village: 'Kinathukadavu',
      type: 'office',
      contextDescription: 'விளைபொருள் பாதுகாப்பு குளிர்பதன மையம்',
    },
    transport: {
      id: 'cont_trans',
      name: 'ராஜா சரக்கு வாகனம் (Raja Pickup)',
      role: 'Mini-Freight & Transport Operator',
      phone: '9842100666',
      village: 'Thondamuthur',
      type: 'provider',
      contextDescription: 'உள்ளூர் சரக்கு போக்குவரத்து சேவை',
    },
    fos: {
      id: 'cont_fos',
      name: 'செல்வம் (FOS Field Officer)',
      role: 'Village Service Assistant',
      phone: '9842100999',
      village: 'Kinathukadavu Cluster',
      type: 'fos',
      contextDescription: 'கிராம சேவை கள அதிகாரி (FOS Assistant)',
    },
    government: {
      id: 'cont_govt',
      name: 'அரசு இ-சேவை மையம் (E-Sevai Hub)',
      role: 'Government Scheme Assistance Officer',
      phone: '18004250000',
      village: 'Taluk Office',
      type: 'office',
      contextDescription: 'அரசு மானியம் & திட்ட உதவி மையம்',
    },
    office: {
      id: 'cont_office',
      name: 'ஊர் கணெக்ட் சேவை மையம் (OoruConnect Hub)',
      role: 'District Support Office',
      phone: '18004251111',
      village: 'District Center',
      type: 'office',
      contextDescription: 'கிராம சேவை உதவி மையம்',
    },
  };

  /**
   * 1. CONTEXT-AWARE CONTACT RESOLUTION
   * Resolves the exact relevant contact based on screen/feature context
   */
  public resolveRelevantContact(params: {
    userId?: string;
    currentScreen: string;
    currentFeature?: string;
    requestId?: string;
    serviceType?: string;
    location?: string;
  }): ServiceContact {
    const screen = params.currentScreen.toLowerCase();
    const feature = (params.currentFeature || '').toLowerCase();
    const service = (params.serviceType || '').toLowerCase();

    if (screen.includes('labor') || feature.includes('labor') || feature.includes('harvest') || service.includes('labour')) {
      return this.mockContacts.labor;
    }
    if (screen.includes('rental') || feature.includes('equipment') || feature.includes('tractor') || service.includes('equipment')) {
      return this.mockContacts.equipment;
    }
    if (screen.includes('mechanic') || screen.includes('technician') || feature.includes('motor') || service.includes('technician')) {
      return this.mockContacts.technician;
    }
    if (screen.includes('fpo') || screen.includes('market') || feature.includes('price') || feature.includes('buyer')) {
      return this.mockContacts.fpo;
    }
    if (screen.includes('storage') || screen.includes('warehouse') || feature.includes('cold')) {
      return this.mockContacts.storage;
    }
    if (screen.includes('driver') || screen.includes('transport') || feature.includes('freight')) {
      return this.mockContacts.transport;
    }
    if (screen.includes('care') || screen.includes('govt') || screen.includes('scheme')) {
      return this.mockContacts.government;
    }
    if (screen.includes('fos') || screen.includes('assist') || feature.includes('help')) {
      return this.mockContacts.fos;
    }

    return this.mockContacts.office;
  }

  /**
   * 2. TAMIL / TANGLISH VOICE INTENT & ENTITY EXTRACTION
   */
  public processVoiceIntent(rawSpeech: string): VoiceIntentResult {
    const speech = rawSpeech.toLowerCase();

    if (speech.includes('harvest') || speech.includes('ஆட்கள்') || speech.includes('peru') || speech.includes('வேலை')) {
      const countMatch = speech.match(/(\d+)/);
      const count = countMatch ? parseInt(countMatch[1]) : 5;

      return {
        rawSpeech,
        detectedIntent: 'CREATE_LABOUR_REQUEST',
        entities: {
          workType: 'Paddy Harvesting',
          workerCount: count,
          date: speech.includes('naalaikku') || speech.includes('நாளை') ? 'Tomorrow' : 'Today',
          urgency: 'normal',
        },
        confirmationTextTa: `நாளைக்கு ${count} அறுவடை வேலை ஆட்கள் தேவை. இந்த கோரிக்கையை உருவாக்கவா?`,
        confirmationTextEn: `Need ${count} harvesting workers for tomorrow. Shall I create this request?`,
        requiresConfirmation: true,
      };
    }

    if (speech.includes('motor') || speech.includes('mechanic') || speech.includes('மெக்கானிக்') || speech.includes('start aagala')) {
      return {
        rawSpeech,
        detectedIntent: 'CREATE_TECHNICIAN_REQUEST',
        entities: {
          serviceType: 'Motor & Pump Mechanic',
          urgency: speech.includes('urgent') || speech.includes('அவசரம்') ? 'urgent' : 'normal',
          date: 'Today',
        },
        confirmationTextTa: 'மோட்டார் மெக்கானிக் அவசர சேவை கோரிக்கை உருவாக்கவா?',
        confirmationTextEn: 'Shall I create an urgent Motor Mechanic service request?',
        requiresConfirmation: true,
      };
    }

    if (speech.includes('available') || speech.includes('தயார்') || speech.includes('வேலை செய்கிறேன்')) {
      return {
        rawSpeech,
        detectedIntent: 'UPDATE_AVAILABILITY',
        entities: {
          status: 'available_today',
        },
        confirmationTextTa: 'இன்று உங்கள் நிலையை "வேலைக்கு தயார்" என மாற்றவா?',
        confirmationTextEn: 'Shall I update your status to "Available Today"?',
        requiresConfirmation: true,
      };
    }

    return {
      rawSpeech,
      detectedIntent: 'UNKNOWN',
      entities: {},
      confirmationTextTa: 'மன்னித்துக்கொள்ளுங்கள், உங்கள் குரலை மீண்டும் கூறவும்.',
      confirmationTextEn: 'Could not understand. Please speak again.',
      requiresConfirmation: false,
    };
  }

  /**
   * 3. FEATURE PHONE / IVR TOUCH-TONE MENU HANDLER
   */
  public processIVRInput(digit: number, phone: string): IVRResponse {
    switch (digit) {
      case 1:
        return {
          menuKey: '1',
          actionTaken: 'CREATE_LABOUR_REQUEST',
          voicePromptTa: 'வேலைக்குழு தேவை பதிவு செய்யப்பட்டது. மேஸ்திரிகள் விரைவில் தொடர்பு கொள்வார்கள்.',
          voicePromptEn: 'Labour squad request registered. Maistries will contact you soon.',
          nextStep: 0,
        };
      case 2:
        return {
          menuKey: '2',
          actionTaken: 'CREATE_TECHNICIAN_REQUEST',
          voicePromptTa: 'மெக்கானிக் சேவை பதிவு செய்யப்பட்டது.',
          voicePromptEn: 'Technician service registered.',
          nextStep: 0,
        };
      case 3:
        return {
          menuKey: '3',
          actionTaken: 'CHECK_STATUS',
          voicePromptTa: 'உங்கள் கோரிக்கை தற்போது மேஸ்திரிகளுக்கு அனுப்பப்படுகிறது.',
          voicePromptEn: 'Your request is currently broadcasting to nearby Maistries.',
          nextStep: 0,
        };
      case 4:
        return {
          menuKey: '4',
          actionTaken: 'UPDATE_AVAILABILITY',
          voicePromptTa: 'உங்கள் நிலை "இன்று வேலைக்கு தயார்" என புதுப்பிக்கப்பட்டது.',
          voicePromptEn: 'Your availability updated to Available Today.',
          nextStep: 0,
        };
      case 5:
      default:
        return {
          menuKey: '5',
          actionTaken: 'CONNECT_FOS',
          voicePromptTa: 'உங்கள் பகுதி கள அதிகாரிக்கு (FOS) அழைப்பு இணைக்கப்படுகிறது.',
          voicePromptEn: 'Connecting your call to local FOS assistant.',
          nextStep: 0,
        };
    }
  }

  /**
   * 4. FOS ASSISTED WORKFLOW
   */
  public processFOSAssistedAction(params: {
    fosId: string;
    targetUserPhone: string;
    actionType: 'REGISTER' | 'CREATE_REQUEST' | 'UPDATE_AVAILABILITY' | 'VOUCH';
    payload: any;
  }): { success: boolean; messageTa: string; messageEn: string } {
    return {
      success: true,
      messageTa: `FOS அதிகாரி (${params.fosId}) மூலம் செயல்பாடு வெற்றிகரமாக பதிவு செய்யப்பட்டது.`,
      messageEn: `Action successfully processed by FOS Officer (${params.fosId}).`,
    };
  }

  /**
   * 5. V-LINK OFFLINE SYNC RECEIPT GENERATOR
   */
  public generateVLinkReceipt(eventId: string): VLinkSyncReceipt {
    return {
      eventId,
      status: 'CLOUD_SYNCED',
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
  }
}

export const ooruConnectBackend = new OoruConnectBackendService();
