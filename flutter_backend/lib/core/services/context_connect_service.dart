class ServiceContact {
  final String id;
  final String name;
  final String role;
  final String phone;
  final String village;
  final String type;
  final String contextDescription;

  ServiceContact({
    required this.id,
    required this.name,
    required this.role,
    required this.phone,
    required this.village,
    required this.type,
    required this.contextDescription,
  });
}

class ContextConnectService {
  static final ContextConnectService instance = ContextConnectService._internal();
  ContextConnectService._internal();

  static final Map<String, ServiceContact> _contacts = {
    'labor': ServiceContact(
      id: 'cont_labor',
      name: 'ரவி மேஸ்திரி (Ravi Maistry)',
      role: 'Harvesting & Labour Squad Lead (12 workers)',
      phone: '9842100111',
      village: 'Vadugapalayam',
      type: 'provider',
      contextDescription: 'அறுவடை மற்றும் ஆட்கள் தேவைக்கான மேஸ்திரி',
    ),
    'equipment': ServiceContact(
      id: 'cont_equip',
      name: 'முருகன் JCB & Tractor Service',
      role: 'Heavy Machinery & Equipment Operator',
      phone: '9842100444',
      village: 'Sulur Cluster',
      type: 'provider',
      contextDescription: 'டிராக்டர் & JCB இயந்திர சேவை நிபுணர்',
    ),
    'technician': ServiceContact(
      id: 'cont_tech',
      name: 'குமார் மோட்டார் ஒர்க்ஸ் (Kumar Mechanic)',
      role: 'Pump, Motor & Electrical Technician',
      phone: '9842100333',
      village: 'Pollachi Rural',
      type: 'provider',
      contextDescription: 'மோட்டார் & எலக்ட்ரிக்கல் பழுதுநீக்கும் நிபுணர்',
    ),
    'fpo': ServiceContact(
      id: 'cont_fpo',
      name: 'தாராபுரம் விவசாயிகள் சங்கம் (FPO Center)',
      role: 'Market Price & Crop Buyer Coordinator',
      phone: '9842100777',
      village: 'Dharapuram Hub',
      type: 'coordinator',
      contextDescription: 'சந்தை விலை & விளைபொருள் கொள்முதல் மையம்',
    ),
    'storage': ServiceContact(
      id: 'cont_storage',
      name: 'கோயம்புத்தூர் குளிர்பதன கிடங்கு (Cold Storage)',
      role: 'Warehouse & Cold Storage Manager',
      phone: '9842100888',
      village: 'Kinathukadavu',
      type: 'office',
      contextDescription: 'விளைபொருள் பாதுகாப்பு குளிர்பதன மையம்',
    ),
    'fos': ServiceContact(
      id: 'cont_fos',
      name: 'செல்வம் (FOS Field Officer)',
      role: 'Village Service Assistant',
      phone: '9842100999',
      village: 'Kinathukadavu Cluster',
      type: 'fos',
      contextDescription: 'கிராம சேவை கள அதிகாரி (FOS Assistant)',
    ),
    'office': ServiceContact(
      id: 'cont_office',
      name: 'ஊர் கணெக்ட் சேவை மையம் (OoruConnect Hub)',
      role: 'District Support Office',
      phone: '18004251111',
      village: 'District Center',
      type: 'office',
      contextDescription: 'கிராம சேவை உதவி மையம்',
    ),
  };

  /// Context-Aware Contact Resolution Engine
  ServiceContact resolveRelevantContact({
    required String currentScreen,
    String? currentFeature,
    String? requestId,
    String? serviceType,
  }) {
    final screen = currentScreen.toLowerCase();
    final feature = (currentFeature ?? '').toLowerCase();
    final service = (serviceType ?? '').toLowerCase();

    if (screen.contains('labor') || feature.contains('labor') || feature.contains('harvest') || service.contains('labour')) {
      return _contacts['labor']!;
    }
    if (screen.contains('rental') || feature.contains('equipment') || feature.contains('tractor') || service.contains('equipment')) {
      return _contacts['equipment']!;
    }
    if (screen.contains('mechanic') || screen.contains('technician') || feature.contains('motor') || service.contains('technician')) {
      return _contacts['technician']!;
    }
    if (screen.contains('fpo') || screen.contains('market') || feature.contains('price') || feature.contains('buyer')) {
      return _contacts['fpo']!;
    }
    if (screen.contains('storage') || screen.contains('warehouse') || feature.contains('cold')) {
      return _contacts['storage']!;
    }
    if (screen.contains('fos') || screen.contains('assist') || feature.contains('help')) {
      return _contacts['fos']!;
    }
    return _contacts['office']!;
  }
}
