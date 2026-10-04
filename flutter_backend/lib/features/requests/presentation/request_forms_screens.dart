import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/constants/app_strings.dart';
import '../../../core/models/ooru_models.dart';

class LabourRequestScreen extends StatefulWidget {
  final Function(ServiceRequestModel req) onSubmitRequest;
  const LabourRequestScreen({super.key, required this.onSubmitRequest});

  @override
  State<LabourRequestScreen> createState() => _LabourRequestScreenState();
}

class _LabourRequestScreenState extends State<LabourRequestScreen> {
  String _selectedWorkType = 'Paddy Harvesting';
  int _workerCount = 10;
  DateTime _selectedDate = DateTime.now().add(const Duration(days: 1));
  String _selectedTime = '7:00 AM';
  String _villageName = 'Vadugapalayam';
  String _duration = '1 day';
  final TextEditingController _rateController = TextEditingController();
  final TextEditingController _notesController = TextEditingController();

  final List<String> _workTypes = [
    'Paddy Harvesting',
    'Planting & Weeding',
    'Construction & Masonry',
    'Loading & Unloading',
  ];

  final List<String> _times = ['6:00 AM', '7:00 AM', '8:00 AM', '1:00 PM'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.labourFormTitle),
        backgroundColor: const Color(0xFF1B5E20),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(AppStrings.workType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(border: Border.all(color: Colors.grey), borderRadius: BorderRadius.circular(8)),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedWorkType,
                  isExpanded: true,
                  items: _workTypes.map((w) => DropdownMenuItem(value: w, child: Text(w))).toList(),
                  onChanged: (val) => setState(() => _selectedWorkType = val!),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(AppStrings.workerCount, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_circle, size: 36, color: Color(0xFF2E7D32)),
                  onPressed: () {
                    if (_workerCount > 1) setState(() => _workerCount--);
                  },
                ),
                Expanded(
                  child: Text(
                    '$_workerCount ஆட்கள் (Workers)',
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_circle, size: 36, color: Color(0xFF2E7D32)),
                  onPressed: () => setState(() => _workerCount++),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Text(AppStrings.dateRequired, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              icon: const Icon(Icons.calendar_today, color: Color(0xFF2E7D32)),
              label: Text(
                DateFormat('yyyy-MM-dd (EEEE)').format(_selectedDate),
                style: const TextStyle(fontSize: 18, color: Colors.black),
              ),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.all(16)),
              onPressed: () async {
                final picked = await showDatePicker(
                  context: context,
                  initialDate: _selectedDate,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 30)),
                );
                if (picked != null) setState(() => _selectedDate = picked);
              },
            ),
            const SizedBox(height: 20),
            Text(AppStrings.timeRequired, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 10,
              children: _times.map((t) {
                final isSel = _selectedTime == t;
                return ChoiceChip(
                  label: Text(t, style: TextStyle(color: isSel ? Colors.white : Colors.black, fontWeight: FontWeight.bold)),
                  selected: isSel,
                  selectedColor: const Color(0xFF2E7D32),
                  onSelected: (sel) => setState(() => _selectedTime = t),
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _rateController,
              decoration: InputDecoration(
                labelText: AppStrings.optionalRate,
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.currency_rupee),
              ),
              keyboardType: TextInputType.text,
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'கூடுதல் விவரங்கள் (Optional Notes)',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.note),
              ),
              maxLines: 2,
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1B5E20),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                final req = ServiceRequestModel(
                  id: 'req_${DateTime.now().millisecondsSinceEpoch}',
                  requesterId: 'current_user',
                  requestType: 'labour_squad',
                  skillName: _selectedWorkType,
                  requiredWorkers: _workerCount,
                  requiredDate: DateFormat('yyyy-MM-dd').format(_selectedDate),
                  requiredTime: _selectedTime,
                  villageName: _villageName,
                  duration: _duration,
                  budgetOffered: _rateController.text.isNotEmpty ? _rateController.text : null,
                  problemDetails: _notesController.text.isNotEmpty ? _notesController.text : null,
                  createdAt: DateTime.now().toIso8601String(),
                );
                widget.onSubmitRequest(req);
              },
              child: Text(AppStrings.searchSquads, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}

class TechnicianRequestScreen extends StatefulWidget {
  final Function(ServiceRequestModel req) onSubmitRequest;
  const TechnicianRequestScreen({super.key, required this.onSubmitRequest});

  @override
  State<TechnicianRequestScreen> createState() => _TechnicianRequestScreenState();
}

class _TechnicianRequestScreenState extends State<TechnicianRequestScreen> {
  String _selectedServiceType = 'Motor & Pump Mechanic';
  final TextEditingController _problemController = TextEditingController();
  String _urgency = 'normal';
  String _requiredTime = 'Today';
  String _villageName = 'Vadugapalayam';

  final List<String> _services = [
    'Motor & Pump Mechanic',
    'Electrician & Wiring',
    'Tractor Operator',
    'JCB & Earthmover Operator',
    'Tree Cutter & Coconut Climber',
    'Sprayer Operator',
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(AppStrings.techFormTitle),
        backgroundColor: const Color(0xFF1565C0),
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(AppStrings.serviceType, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(border: Border.all(color: Colors.grey), borderRadius: BorderRadius.circular(8)),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _selectedServiceType,
                  isExpanded: true,
                  items: _services.map((s) => DropdownMenuItem(value: s, child: Text(s))).toList(),
                  onChanged: (val) => setState(() => _selectedServiceType = val!),
                ),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _problemController,
              decoration: InputDecoration(
                labelText: AppStrings.problemDetails,
                hintText: 'எ.கா: மோட்டார் ஆன் ஆகவில்லை, ஒயரிங் பிரச்சனை',
                border: const OutlineInputBorder(),
                prefixIcon: const Icon(Icons.build),
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 20),
            Text(AppStrings.urgency, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: ChoiceChip(
                    label: Text(AppStrings.normal, style: TextStyle(color: _urgency == 'normal' ? Colors.white : Colors.black)),
                    selected: _urgency == 'normal',
                    selectedColor: const Color(0xFF1565C0),
                    onSelected: (sel) => setState(() => _urgency = 'normal'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ChoiceChip(
                    label: Text(AppStrings.urgent, style: TextStyle(color: _urgency == 'urgent' ? Colors.white : Colors.black)),
                    selected: _urgency == 'urgent',
                    selectedColor: Colors.red[700],
                    onSelected: (sel) => setState(() => _urgency = 'urgent'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF1565C0),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.all(18),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                final req = ServiceRequestModel(
                  id: 'req_${DateTime.now().millisecondsSinceEpoch}',
                  requesterId: 'current_user',
                  requestType: 'technician',
                  skillName: _selectedServiceType,
                  requiredWorkers: 1,
                  requiredDate: DateFormat('yyyy-MM-dd').format(DateTime.now()),
                  requiredTime: _requiredTime,
                  villageName: _villageName,
                  problemDetails: _problemController.text,
                  urgency: _urgency,
                  createdAt: DateTime.now().toIso8601String(),
                );
                widget.onSubmitRequest(req);
              },
              child: Text(AppStrings.searchTechnician, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
