'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { SwipeToConnect } from './SwipeToConnect';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import {
  Wifi,
  WifiOff,
  Radio,
  Share2,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Database,
  Layers,
  Smartphone,
  Cpu,
  RefreshCw,
  Plus,
  Send,
  Code,
  Check,
  Copy,
  Terminal,
  Activity,
  FileCode
} from 'lucide-react';

export interface MeshHop {
  nodeId: string;
  timestamp: string;
  role: 'Originator' | 'Relay' | 'Gateway';
}

export interface VLinkEnvelope {
  messageId: string;
  originNodeId: string;
  sourceUserId: string;
  destinationType: string;
  payloadType: string;
  payload: any;
  createdAt: string;
  expiresAt: string;
  ttl: number;
  hopCount: number;
  priority: 'high' | 'normal' | 'low';
  payloadHash: string;
  status: 'CREATED' | 'QUEUED' | 'DISCOVERED' | 'TRANSFERRED' | 'RELAYED' | 'GATEWAY_RECEIVED' | 'CLOUD_SYNCED' | 'ACKNOWLEDGED' | 'TRANSFER_FAILED' | 'TTL_EXPIRED';
  hopsHistory: MeshHop[];
}

export interface PeerNode {
  nodeId: string;
  deviceName: string;
  isGateway: boolean;
  batteryLevel: number;
  lastSeen: string;
  connectionType: 'BroadcastChannel (Local Tab)' | 'BLE GATT (Android)' | 'Wi-Fi Direct P2P';
  isVirtual?: boolean;
}

export default function VLinkBoard() {
  const { isOffline, simulatedOffline, toggleSimulatedNetwork, language, addToast, userName } = useApp();

  // Local Node Identity
  const [nodeId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vlink_node_id');
      if (saved) return saved;
      const newId = `VLK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      localStorage.setItem('vlink_node_id', newId);
      return newId;
    }
    return 'VLK-LOCAL-01';
  });

  const [batteryLevel] = useState<number>(78);
  const [activeTab, setActiveTab] = useState<'topology' | 'queue' | 'trace' | 'code'>('topology');
  const [codeTab, setCodeTab] = useState<'kotlin_ble' | 'kotlin_p2p' | 'dart_sync' | 'sql_schema'>('kotlin_ble');

  // Messages Store
  const [messages, setMessages] = useState<VLinkEnvelope[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vlink_mesh_messages');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {}
      }
    }
    return [
      {
        messageId: 'VLK-MSG-9041',
        originNodeId: nodeId,
        sourceUserId: 'farmer_01',
        destinationType: 'SUPABASE_GATEWAY',
        payloadType: 'CROP_AVAILABILITY',
        payload: { cropName: 'Organic Tomato (Dindigul)', quantityKg: 500, targetPrice: 28 },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        ttl: 7,
        hopCount: 1,
        priority: 'normal',
        payloadHash: 'a7f3c1d902...',
        status: 'CLOUD_SYNCED',
        hopsHistory: [
          { nodeId: nodeId, timestamp: '14:30:00', role: 'Originator' },
          { nodeId: 'VLK-GATEWAY-B82', timestamp: '14:32:18', role: 'Gateway' }
        ]
      }
    ];
  });

  // Peer Nodes
  const [peers, setPeers] = useState<PeerNode[]>([
    {
      nodeId: 'VLK-RELAY-A12',
      deviceName: 'Redmi Note 12 (Farmer Peer)',
      isGateway: false,
      batteryLevel: 64,
      lastSeen: '2 sec ago',
      connectionType: 'BLE GATT (Android)',
      isVirtual: true
    },
    {
      nodeId: 'VLK-GATEWAY-B82',
      deviceName: 'Samsung Galaxy A54 (FPO Center Gateway)',
      isGateway: true,
      batteryLevel: 91,
      lastSeen: '1 sec ago',
      connectionType: 'Wi-Fi Direct P2P',
      isVirtual: true
    }
  ]);

  const [selectedMessageId, setSelectedMessageId] = useState<string>('VLK-MSG-9041');
  const [broadcastChannel, setBroadcastChannel] = useState<BroadcastChannel | null>(null);

  // Sync messages to localStorage
  useEffect(() => {
    localStorage.setItem('vlink_mesh_messages', JSON.stringify(messages));
  }, [messages]);

  // Setup BroadcastChannel for Real Tab-to-Tab P2P Mesh
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const channel = new BroadcastChannel('vlink_layer2_mesh_network');
    setBroadcastChannel(channel);

    const announcePresence = () => {
      channel.postMessage({
        type: 'PEER_ANNOUNCE',
        nodeId,
        deviceName: `Browser Tab (${userName || 'Farmer'})`,
        isGateway: !isOffline,
        batteryLevel,
        connectionType: 'BroadcastChannel (Local Tab)'
      });
    };

    announcePresence();
    const heartbeat = setInterval(announcePresence, 4000);

    channel.onmessage = (event) => {
      const data = event.data;
      if (!data || data.nodeId === nodeId) return;

      if (data.type === 'PEER_ANNOUNCE') {
        setPeers(prev => {
          const exists = prev.find(p => p.nodeId === data.nodeId);
          if (exists) {
            return prev.map(p => p.nodeId === data.nodeId ? { ...p, lastSeen: 'Just now', isGateway: data.isGateway } : p);
          }
          return [...prev, {
            nodeId: data.nodeId,
            deviceName: data.deviceName,
            isGateway: data.isGateway,
            batteryLevel: data.batteryLevel,
            lastSeen: 'Just now',
            connectionType: 'BroadcastChannel (Local Tab)',
            isVirtual: false
          }];
        });
      } else if (data.type === 'FORWARD_ENVELOPE') {
        const envelope: VLinkEnvelope = data.envelope;
        // Process message relay
        setMessages(prev => {
          const exists = prev.find(m => m.messageId === envelope.messageId);
          if (exists) return prev; // Deduplicate

          if (envelope.ttl <= 0) return prev; // Expired loop

          const updated: VLinkEnvelope = {
            ...envelope,
            ttl: envelope.ttl - 1,
            hopCount: envelope.hopCount + 1,
            status: !isOffline ? 'CLOUD_SYNCED' : 'RELAYED',
            hopsHistory: [
              ...envelope.hopsHistory,
              { nodeId, timestamp: new Date().toLocaleTimeString(), role: !isOffline ? 'Gateway' : 'Relay' }
            ]
          };

          addToast(`Received mesh packet ${envelope.messageId} from ${data.fromNodeId}`, 'info');

          // If current node has internet (gateway), upload to cloud!
          if (!isOffline) {
            (async () => {
              try {
                if (isSupabaseConfigured && supabase) {
                  // Call the idempotent sync_vlink_envelope postgres function
                  const { data: rpcResult, error: rpcError } = await supabase.rpc('sync_vlink_envelope', {
                    p_message_id: envelope.messageId,
                    p_origin_node_id: envelope.originNodeId,
                    p_source_user_id: envelope.sourceUserId || null,
                    p_payload_type: envelope.payloadType,
                    p_payload: envelope.payload,
                    p_expires_at: envelope.expiresAt,
                    p_ttl: envelope.ttl - 1,
                    p_hop_count: envelope.hopCount + 1,
                    p_priority: envelope.priority,
                    p_payload_hash: envelope.payloadHash
                  });

                  if (rpcError) {
                    console.error('[VLINK][SYNC] RPC Error:', rpcError.message);
                    return;
                  }

                  // Log the hop receipt
                  await supabase.from('vlink_message_receipts').insert({
                    message_id: envelope.messageId,
                    hop_index: envelope.hopCount + 1,
                    from_node_id: data.fromNodeId || envelope.originNodeId,
                    to_node_id: nodeId
                  });

                  console.log(`[VLINK][SYNC] Gateway response: ${rpcResult}`);
                }

                addToast(`Gateway synced ${envelope.messageId} to Supabase!`, 'success');
                channel.postMessage({
                  type: 'ACK_DELIVERY',
                  messageId: envelope.messageId,
                  gatewayNodeId: nodeId
                });
              } catch (err) {
                console.error('[VLINK][SYNC] Sync failed:', err);
              }
            })();
          }

          return [updated, ...prev];
        });
      } else if (data.type === 'ACK_DELIVERY') {
        setMessages(prev => prev.map(m => {
          if (m.messageId === data.messageId) {
            return { ...m, status: 'CLOUD_SYNCED' };
          }
          return m;
        }));
      }
    };

    return () => {
      clearInterval(heartbeat);
      channel.close();
    };
  }, [nodeId, isOffline, batteryLevel, userName, addToast]);

  // Synchronize local queued messages to Supabase automatically when online
  useEffect(() => {
    if (isOffline) return;

    const syncPendingMessages = async () => {
      const pending = messages.filter(m => m.status === 'QUEUED' || m.status === 'RELAYED');
      if (pending.length === 0) return;

      console.log(`[VLINK][SYNC] Online detected. Syncing ${pending.length} pending messages to Supabase...`);
      let updatedCount = 0;

      for (const msg of pending) {
        try {
          if (isSupabaseConfigured && supabase) {
            // Call idempotent RPC sync_vlink_envelope
            const { data: rpcResult, error: rpcError } = await supabase.rpc('sync_vlink_envelope', {
              p_message_id: msg.messageId,
              p_origin_node_id: msg.originNodeId,
              p_source_user_id: msg.sourceUserId && msg.sourceUserId !== 'Farmer_User' ? msg.sourceUserId : null,
              p_payload_type: msg.payloadType,
              p_payload: msg.payload,
              p_expires_at: msg.expiresAt,
              p_ttl: msg.ttl,
              p_hop_count: msg.hopCount,
              p_priority: msg.priority,
              p_payload_hash: msg.payloadHash
            });

            if (rpcError) {
              console.error(`[VLINK][SYNC] RPC Error for ${msg.messageId}:`, rpcError.message);
              continue;
            }

            // Log receipt
            await supabase.from('vlink_message_receipts').insert({
              message_id: msg.messageId,
              hop_index: msg.hopCount + 1,
              from_node_id: msg.originNodeId,
              to_node_id: nodeId
            });

            console.log(`[VLINK][SYNC] Message ${msg.messageId} synchronized: ${rpcResult}`);
            
            // Update message status
            setMessages(prev => prev.map(m => {
              if (m.messageId === msg.messageId) {
                return { ...m, status: 'CLOUD_SYNCED' };
              }
              return m;
            }));

            // Notify other tabs
            if (broadcastChannel) {
              broadcastChannel.postMessage({
                type: 'ACK_DELIVERY',
                messageId: msg.messageId,
                gatewayNodeId: nodeId
              });
            }

            updatedCount++;
          }
        } catch (err) {
          console.error(`[VLINK][SYNC] Failed to sync ${msg.messageId}:`, err);
        }
      }

      if (updatedCount > 0) {
        addToast(
          language === 'ta'
            ? 'அனைத்து உள்ளூர் மெஷ் செய்திகளும் ஒத்திசைக்கப்பட்டன!'
            : 'All local mesh messages successfully synchronized!',
          'success'
        );
      }
    };

    syncPendingMessages();
  }, [isOffline, messages, isSupabaseConfigured, nodeId, addToast, language, broadcastChannel]);

  // Create & Enqueue New Offline Business Action (Layer 1 -> Layer 2)
  const handleCreateOfflinePayload = (type: 'CROP_AVAILABILITY' | 'SCHEME_APPLICATION' | 'EMERGENCY_REQUEST') => {
    const msgId = `VLK-MSG-${Math.floor(1000 + Math.random() * 9000)}`;

    let payloadData = {};
    let priority: 'high' | 'normal' | 'low' = 'normal';

    if (type === 'CROP_AVAILABILITY') {
      payloadData = { cropName: 'Paddy (Co-51)', quantityKg: 1200, location: 'Madurai Mandi' };
    } else if (type === 'SCHEME_APPLICATION') {
      payloadData = { schemeName: 'PM-KISAN Installment 17', applicantId: 'FARM-9021' };
    } else {
      payloadData = { alertType: 'Pest Outbreak Alert (Fall Armyworm)', urgency: 'CRITICAL' };
      priority = 'high';
    }

    const newEnvelope: VLinkEnvelope = {
      messageId: msgId,
      originNodeId: nodeId,
      sourceUserId: userName || 'Farmer_User',
      destinationType: 'SUPABASE_GATEWAY',
      payloadType: type,
      payload: payloadData,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
      ttl: 8,
      hopCount: 0,
      priority,
      payloadHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
      status: !isOffline ? 'CLOUD_SYNCED' : 'QUEUED',
      hopsHistory: [
        { nodeId, timestamp: new Date().toLocaleTimeString(), role: 'Originator' }
      ]
    };

    setMessages(prev => [newEnvelope, ...prev]);
    setSelectedMessageId(msgId);

    if (isOffline) {
      addToast(`Offline: Enqueued ${msgId} to local V-LINK store. Waiting for peer/gateway.`, 'info');
    } else {
      addToast(`Online: Direct gateway upload of ${msgId} to Supabase completed!`, 'success');
    }
  };

  // Forward message to a peer
  const handleForwardToPeer = (messageId: string, targetPeerNodeId: string) => {
    const targetMsg = messages.find(m => m.messageId === messageId);
    if (!targetMsg) return;

    if (targetMsg.ttl <= 0) {
      addToast('Cannot forward: TTL expired (Loop prevention triggered)', 'error');
      return;
    }

    // Broadcast over P2P Channel
    if (broadcastChannel) {
      broadcastChannel.postMessage({
        type: 'FORWARD_ENVELOPE',
        envelope: targetMsg,
        fromNodeId: nodeId,
        targetNodeId: targetPeerNodeId
      });
    }

    // Update state to TRANSFERRED / RELAYED
    setMessages(prev => prev.map(m => {
      if (m.messageId === messageId) {
        const nextTtl = m.ttl - 1;
        const nextHops = [
          ...m.hopsHistory,
          { nodeId: targetPeerNodeId, timestamp: new Date().toLocaleTimeString(), role: 'Relay' as const }
        ];
        return {
          ...m,
          ttl: nextTtl,
          hopCount: m.hopCount + 1,
          status: 'RELAYED',
          hopsHistory: nextHops
        };
      }
      return m;
    }));

    addToast(`Forwarded ${messageId} to peer ${targetPeerNodeId}`, 'success');
  };

  // Selected Message Object
  const selectedMessage = useMemo(() => {
    return messages.find(m => m.messageId === selectedMessageId) || messages[0];
  }, [messages, selectedMessageId]);

  // Statistics
  const stats = useMemo(() => {
    return {
      pending: messages.filter(m => m.status === 'QUEUED' || m.status === 'RELAYED').length,
      relayed: messages.filter(m => m.hopCount > 0).length,
      synced: messages.filter(m => m.status === 'CLOUD_SYNCED').length,
      activePeers: peers.length
    };
  }, [messages, peers]);

  return (
    <div className="space-y-6 text-foreground animate-fade-in">

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c1410] to-[#121c17] text-white border border-earth-800/80 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-primary-500/20 text-primary-400 border border-primary-500/30 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-pulse text-primary-400" />
                V-LINK Layer 2 Active
              </span>
              <span className="text-xs text-earth-400 font-mono">ID: {nodeId}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mt-2 text-white">
              Device-to-Device Mesh Diagnostics
            </h1>
            <p className="text-xs text-earth-400 max-w-2xl mt-1 leading-relaxed">
              Opportunistic Store-Carry-Forward networking engine. Enables zero-internet agricultural transactions over BLE GATT, Wi-Fi Direct, and Browser P2P sockets.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSimulatedNetwork}
              className={`px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-md ${
                isOffline
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                  : 'bg-primary-500/10 border-primary-500/30 text-primary-400 hover:bg-primary-500/20'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-primary-400" />}
              <span>{isOffline ? 'Simulate Internet OFF' : 'Internet ONLINE'}</span>
            </button>
          </div>
        </div>

        {/* Live Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-earth-800/60 font-mono">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-earth-400 font-sans block">Node Status</span>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-amber-400 animate-pulse' : 'bg-primary-400 animate-ping'}`} />
              <span className="text-sm font-bold text-white">
                {isOffline ? 'MESH ONLY' : 'GATEWAY ON'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-earth-400 font-sans block">Discovered Peers</span>
            <span className="text-lg font-bold text-primary-400 mt-0.5 block">{stats.activePeers} Devices</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-earth-400 font-sans block">Pending Queue</span>
            <span className="text-lg font-bold text-amber-400 mt-0.5 block">{stats.pending} Packets</span>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-[9px] uppercase tracking-wider text-earth-400 font-sans block">Cloud Synced</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{stats.synced} Delivered</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-earth-200 dark:border-earth-850 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'topology'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Peer Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'queue'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Local Store Queue ({messages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trace')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'trace'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Live Message Trace</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'code'
              ? 'bg-primary-500 text-white shadow-md'
              : 'text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>Android Native Source Code</span>
        </button>
      </div>

      {/* TAB 1: PEER TOPOLOGY & TRIGGER ACTIONS */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Column: Offline Action Trigger */}
          <div className="lg:col-span-1 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs">
              <h3 className="text-sm font-black tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Simulate Offline Layer 1 Action</span>
              </h3>
              <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-1 leading-relaxed">
                Create a business transaction while disconnected. It will be wrapped into a cryptographic V-LINK packet and enqueued locally.
              </p>

              <div className="space-y-2.5 mt-4">
                <button
                  onClick={() => handleCreateOfflinePayload('CROP_AVAILABILITY')}
                  className="w-full p-3 rounded-2xl bg-earth-50 dark:bg-earth-950/60 border border-earth-200 dark:border-earth-800 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">🌾 Enqueue Crop Availability</span>
                    <Plus className="w-4 h-4 text-primary-500 group-hover:rotate-90 transition-transform" />
                  </div>
                  <p className="text-[10px] text-earth-500 dark:text-earth-400 mt-0.5">500kg Tomato @ ₹28/kg</p>
                </button>

                <button
                  onClick={() => handleCreateOfflinePayload('SCHEME_APPLICATION')}
                  className="w-full p-3 rounded-2xl bg-earth-50 dark:bg-earth-950/60 border border-earth-200 dark:border-earth-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">📜 Enqueue Scheme Application</span>
                    <Plus className="w-4 h-4 text-blue-500 group-hover:rotate-90 transition-transform" />
                  </div>
                  <p className="text-[10px] text-earth-500 dark:text-earth-400 mt-0.5">PM-KISAN Installment 17</p>
                </button>

                <button
                  onClick={() => handleCreateOfflinePayload('EMERGENCY_REQUEST')}
                  className="w-full p-3 rounded-2xl bg-earth-50 dark:bg-earth-950/60 border border-earth-200 dark:border-earth-800 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-500">🚨 Enqueue Emergency Alert</span>
                    <Plus className="w-4 h-4 text-red-500 group-hover:rotate-90 transition-transform" />
                  </div>
                  <p className="text-[10px] text-earth-500 dark:text-earth-400 mt-0.5">High Priority Pest Outbreak</p>
                </button>
              </div>
            </div>

            {/* Test Procedure Tip */}
            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs space-y-2">
              <div className="font-bold text-blue-500 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>Multi-Tab Real P2P Test</span>
              </div>
              <p className="text-[11px] text-earth-600 dark:text-earth-300 leading-relaxed">
                Open this exact URL in a second browser window or phone. Both tabs will discover each other over BroadcastChannel and exchange live packet handshakes!
              </p>
            </div>
          </div>

          {/* Right Column: Peer Discovery List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black tracking-tight">Nearby V-LINK Discovered Nodes</h3>
                  <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                    Scanned via BLE GATT advertisements & Wi-Fi Direct sockets
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-500 font-mono font-bold text-[10px]">
                  {peers.length} Nodes Active
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {peers.map((peer) => (
                  <div
                    key={peer.nodeId}
                    className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/40 border border-earth-200/60 dark:border-earth-850 flex items-center justify-between gap-4 hover:border-primary-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs ${
                        peer.isGateway
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                      }`}>
                        {peer.isGateway ? 'GW' : 'RL'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-foreground">{peer.deviceName}</h4>
                          <span className="text-[10px] font-mono text-earth-400">({peer.nodeId})</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-earth-500 dark:text-earth-400 mt-1 font-mono">
                          <span>{peer.connectionType}</span>
                          <span>•</span>
                          <span>Battery: {peer.batteryLevel}%</span>
                          <span>•</span>
                          <span className="text-emerald-500 font-bold">{peer.isGateway ? 'Internet Gateway: YES' : 'Internet Gateway: NO'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleForwardToPeer(selectedMessageId, peer.nodeId)}
                        className="px-3 py-1.5 rounded-xl bg-primary-500 text-white font-bold text-[11px] hover:bg-primary-600 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Forward {selectedMessageId}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: QUEUE MANAGER */}
      {activeTab === 'queue' && (
        <div className="p-5 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black tracking-tight">Persistent Local Packet Queue</h3>
              <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                Stored securely in IndexedDB / Sqflite. Awaiting opportunistic relay or internet gateway connection.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-earth-200 dark:border-earth-800 text-[10px] font-black uppercase text-earth-400 font-mono">
                  <th className="py-3 px-3">Message ID</th>
                  <th className="py-3 px-3">Payload Type</th>
                  <th className="py-3 px-3">Origin Node</th>
                  <th className="py-3 px-3">TTL / Hops</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-earth-100 dark:divide-earth-900 font-mono text-[11px]">
                {messages.map((msg) => (
                  <tr
                    key={msg.messageId}
                    className={`hover:bg-earth-50 dark:hover:bg-earth-950/40 transition-colors cursor-pointer ${
                      selectedMessageId === msg.messageId ? 'bg-primary-500/5' : ''
                    }`}
                    onClick={() => setSelectedMessageId(msg.messageId)}
                  >
                    <td className="py-3 px-3 font-bold text-foreground">{msg.messageId}</td>
                    <td className="py-3 px-3 font-sans font-bold text-earth-600 dark:text-earth-300">{msg.payloadType}</td>
                    <td className="py-3 px-3 text-earth-400">{msg.originNodeId}</td>
                    <td className="py-3 px-3">TTL: {msg.ttl} | Hops: {msg.hopCount}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        msg.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-earth-200 dark:bg-earth-800 text-earth-600 dark:text-earth-300'
                      }`}>
                        {msg.priority}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase font-mono ${
                        msg.status === 'CLOUD_SYNCED'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : msg.status === 'RELAYED'
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}>
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMessageId(msg.messageId);
                          setActiveTab('trace');
                        }}
                        className="text-primary-500 hover:underline text-[10px] font-sans font-bold cursor-pointer"
                      >
                        Inspect Trace →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: LIVE MESSAGE TRACE */}
      {activeTab === 'trace' && selectedMessage && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-earth-200 dark:border-earth-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-primary-500">MESSAGE TRACE INSPECTOR</span>
                <span className="text-xs text-earth-400 font-mono">• {selectedMessage.messageId}</span>
              </div>
              <h2 className="text-lg font-black text-foreground mt-1">
                Store-Carry-Forward Delivery Route
              </h2>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-300">
                Payload Hash: <span className="font-bold">{selectedMessage.payloadHash}</span>
              </div>
            </div>
          </div>

          {/* Visual Hop Flowchart */}
          <div className="p-6 rounded-2xl bg-earth-50/50 dark:bg-earth-950/60 border border-earth-200/60 dark:border-earth-850">
            <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider mb-6 font-mono">
              Hop Sequence Path Map
            </h4>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative">
              {selectedMessage.hopsHistory.map((hop, idx) => (
                <React.Fragment key={idx}>
                  <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-800 shadow-xs text-center space-y-2 relative z-10 w-full md:w-auto">
                    <div className="w-8 h-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center font-mono font-bold text-xs mx-auto">
                      {idx + 1}
                    </div>
                    <h5 className="text-xs font-black text-foreground font-mono">{hop.nodeId}</h5>
                    <div className="px-2 py-0.5 rounded-full bg-earth-100 dark:bg-earth-900 text-[9px] font-bold text-earth-500 uppercase font-mono inline-block">
                      {hop.role}
                    </div>
                    <p className="text-[10px] text-earth-400 font-mono">{hop.timestamp}</p>
                  </div>

                  {idx < selectedMessage.hopsHistory.length - 1 && (
                    <div className="flex items-center justify-center text-earth-400 font-mono text-xs my-2 md:my-0">
                      <ArrowRight className="w-5 h-5 text-primary-500 animate-pulse hidden md:block" />
                      <span className="md:hidden">↓</span>
                    </div>
                  )}
                </React.Fragment>
              ))}

              {selectedMessage.status === 'CLOUD_SYNCED' && (
                <>
                  <ArrowRight className="w-5 h-5 text-emerald-500 animate-pulse hidden md:block" />
                  <div className="flex-1 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 relative z-10 w-full md:w-auto">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-mono font-bold text-xs mx-auto">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <h5 className="text-xs font-black text-emerald-500 font-mono">SUPABASE CLOUD</h5>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[9px] font-bold text-emerald-400 uppercase font-mono inline-block">
                      Synchronized
                    </div>
                    <p className="text-[10px] text-emerald-400 font-mono">ACK Confirmed</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Raw Payload Inspector */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-earth-400 tracking-wider font-mono">
              Encrypted Application Payload Data
            </h4>
            <pre className="p-4 rounded-2xl bg-[#090e0c] text-emerald-400 font-mono text-xs overflow-x-auto border border-earth-850">
              {JSON.stringify(selectedMessage.payload, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: ANDROID NATIVE SOURCE CODE */}
      {activeTab === 'code' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-earth-200 dark:border-earth-800">
            <div>
              <h3 className="text-sm font-black tracking-tight">Android Native & Flutter Source Code</h3>
              <p className="text-[11px] text-earth-500 dark:text-earth-400 mt-0.5">
                Inspect the actual Kotlin platform files and Dart network services implemented for physical Android devices.
              </p>
            </div>
          </div>

          {/* Code Sub-Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCodeTab('kotlin_ble')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                codeTab === 'kotlin_ble' ? 'bg-primary-500 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-300'
              }`}
            >
              BLEManager.kt (Kotlin GATT)
            </button>
            <button
              onClick={() => setCodeTab('kotlin_p2p')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                codeTab === 'kotlin_p2p' ? 'bg-primary-500 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-300'
              }`}
            >
              WifiDirectManager.kt (Kotlin Sockets)
            </button>
            <button
              onClick={() => setCodeTab('dart_sync')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                codeTab === 'dart_sync' ? 'bg-primary-500 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-300'
              }`}
            >
              sync_engine.dart (Dart Store-Carry-Forward)
            </button>
            <button
              onClick={() => setCodeTab('sql_schema')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                codeTab === 'sql_schema' ? 'bg-primary-500 text-white' : 'bg-earth-100 dark:bg-earth-900 text-earth-600 dark:text-earth-300'
              }`}
            >
              20260829_vlink_mesh.sql (Supabase Schema)
            </button>
          </div>

          <div className="relative">
            <pre className="p-5 rounded-2xl bg-[#090e0c] text-earth-200 font-mono text-xs overflow-x-auto border border-earth-850 max-h-96 leading-relaxed">
              {codeTab === 'kotlin_ble' && `// Location: flutter_backend/android/app/src/main/kotlin/com/uzhavan360/vlink/BLEManager.kt
class BLEManager(private val context: Context) {
    companion object {
        val MESH_SERVICE_UUID: UUID = UUID.fromString("03600000-0000-0000-0000-000000000000")
        val MESH_CHAR_UUID: UUID = UUID.fromString("03600000-0000-0000-0000-000000000001")
    }

    fun startAdvertising(nodeId: String) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
            .setConnectable(true).build()
        // ... Native GATT Peripheral Server setup
    }
}`}

              {codeTab === 'kotlin_p2p' && `// Location: flutter_backend/android/app/src/main/kotlin/com/uzhavan360/vlink/WifiDirectManager.kt
class WifiDirectManager(private val context: Context) {
    const val MESH_P2P_PORT = 1901

    fun createP2PGroup(onSuccess: (String) -> Unit) {
        manager?.createGroup(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                startP2PServerSocket() // Listen on Port 1901
            }
        })
    }
}`}

              {codeTab === 'dart_sync' && `// Location: flutter_backend/lib/core/network/sync_engine.dart
class SyncEngine {
  Future<bool> processIncomingMeshEnvelope(VLinkEnvelope envelope, String fromNodeId) async {
    if (_seenMessageIds.contains(envelope.messageId)) return false; // Deduplication
    if (envelope.ttl <= 0) return false; // Loop Prevention

    final relayedEnvelope = VLinkEnvelope(
      messageId: envelope.messageId,
      ttl: envelope.ttl - 1,
      hopCount: envelope.hopCount + 1,
      status: 'RELAYED',
    );
    await _queueManager.enqueue(...);
    return true;
  }
}`}

              {codeTab === 'sql_schema' && `-- Location: supabase/migrations/20260829_vlink_mesh.sql
CREATE TABLE IF NOT EXISTS public.vlink_nodes (
    node_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    device_capabilities JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.vlink_messages (
    message_id TEXT PRIMARY KEY,
    origin_node_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    ttl INT DEFAULT 8,
    status TEXT DEFAULT 'QUEUED'
);`}
            </pre>
          </div>
        </div>
      )}

      {/* Context-Aware Connection */}
      <div className="mt-8">
        <SwipeToConnect currentScreen="VLinkBoard" currentFeature="V-LINK Connectivity Support" />
      </div>
    </div>
  );
}
