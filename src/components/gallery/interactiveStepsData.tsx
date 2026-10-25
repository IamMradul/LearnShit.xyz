import React from 'react';

export interface InteractiveStep {
  title: string;
  description: string;
  render: () => React.ReactNode;
}

export function getInteractiveSteps(id: string, themeColor: string = 'var(--accent)'): InteractiveStep[] {
  switch (id) {
    case 'array':
      return [
        {
          title: 'Memory Allocation',
          description: 'Fixed contiguous block of 4 slots allocated at base pointer 0x1000 in O(1).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(18, 38)">
                {[2, 5, 1, 9].map((val, i) => (
                  <g key={i} transform={`translate(${i * 52}, 0)`}>
                    <rect x="0" y="0" width="48" height="34" fill="#141720" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" rx="4" />
                    <text x="24" y="22" textAnchor="middle" fill="#F7F5EF" fontSize="15" fontWeight="700" fontFamily="monospace">{val}</text>
                    <text x="24" y="50" textAnchor="middle" fill="#9B9A95" fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Random Access: arr[1]',
          description: 'Direct offset calculation: Address = base + 1 × 4 bytes = 0x1004. Returns 5 in O(1) time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(18, 38)">
                {[2, 5, 1, 9].map((val, i) => (
                  <g key={i} transform={`translate(${i * 52}, 0)`}>
                    <rect x="0" y="0" width="48" height="34" fill={i === 1 ? 'rgba(214,82,58,0.2)' : '#141720'} stroke={i === 1 ? 'var(--accent)' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 1 ? 2.5 : 1.5} rx="4" />
                    <text x="24" y="22" textAnchor="middle" fill={i === 1 ? 'var(--accent)' : '#F7F5EF'} fontSize="15" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="24" y="50" textAnchor="middle" fill={i === 1 ? 'var(--accent)' : '#9B9A95'} fontSize="11" fontWeight="700" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Push: arr.append(42)',
          description: 'Appends 42 at the next available index [4]. Memory is updated in O(1) amortized.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(8, 38)">
                {[2, 5, 1, 9, 42].map((val, i) => (
                  <g key={i} transform={`translate(${i * 45}, 0)`}>
                    <rect x="0" y="0" width="41" height="34" fill={i === 4 ? 'rgba(56,161,105,0.25)' : '#141720'} stroke={i === 4 ? '#38A169' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 4 ? 2 : 1.5} rx="4" />
                    <text x="20" y="22" textAnchor="middle" fill={i === 4 ? '#38A169' : '#F7F5EF'} fontSize="14" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="20" y="50" textAnchor="middle" fill={i === 4 ? '#38A169' : '#9B9A95'} fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
        {
          title: 'Mutation: arr[2] = 99',
          description: 'In-place update: overwrites value at slot [2] from 1 to 99 with zero overhead.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(8, 38)">
                {[2, 5, 99, 9, 42].map((val, i) => (
                  <g key={i} transform={`translate(${i * 45}, 0)`}>
                    <rect x="0" y="0" width="41" height="34" fill={i === 2 ? 'rgba(229,169,60,0.25)' : '#141720'} stroke={i === 2 ? '#E5A93C' : 'rgba(247,245,239,0.2)'} strokeWidth={i === 2 ? 2.5 : 1.5} rx="4" />
                    <text x="20" y="22" textAnchor="middle" fill={i === 2 ? '#E5A93C' : '#F7F5EF'} fontSize="14" fontWeight="800" fontFamily="monospace">{val}</text>
                    <text x="20" y="50" textAnchor="middle" fill={i === 2 ? '#E5A93C' : '#9B9A95'} fontSize="10" fontFamily="monospace">[{i}]</text>
                  </g>
                ))}
              </g>
            </svg>
          ),
        },
      ];

    case 'sorting':
      return [
        {
          title: 'Initial State',
          description: 'Unsorted array of 5 elements: [35, 22, 68, 95, 50].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[35, 22, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill="#38bdf8" rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Compare: 35 > 22',
          description: 'Comparing index [0]=35 with index [1]=22: Inversion detected! Swap required.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[35, 22, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i < 2 ? '#E5A93C' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Swap: [22, 35]',
          description: 'Swapped elements 35 and 22. Index [0] is now smaller than [1].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 68, 95, 50].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i < 2 ? 'var(--accent)' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Pass 1 Complete: 95 in Place',
          description: 'Maximum element 95 has bubbled to the final slot [3]. Marked as sorted.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 68, 50, 95].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill={i === 4 ? '#38A169' : '#38bdf8'} rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Array Sorted',
          description: 'All passes complete! Elements in ascending order: [22, 35, 50, 68, 95].',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(42, 16)">
                {[22, 35, 50, 68, 95].map((h, i) => (
                  <g key={i} transform={`translate(${i * 32}, 0)`}>
                    <rect x="0" y={95 - h * 0.9} width="22" height={h * 0.9} fill="#38A169" rx="3" />
                    <text x="11" y={90 - h * 0.9} textAnchor="middle" fill="#F7F5EF" fontSize="9" fontFamily="monospace">{h}</text>
                  </g>
                ))}
                <line x1="-5" y1="97" x2="160" y2="97" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
              </g>
            </svg>
          ),
        },
      ];

    case 'bitmask':
      return [
        {
          title: '4-Bit Mask Representation',
          description: 'Set {0, 1, 3} mapped to integer 11 in binary: 1 0 1 1.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 30)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1  0  1  1</text>
                <text x="0" y="44" fill="#9B9A95" fontSize="11" fontFamily="monospace">INDEX:  3  2  1  0</text>
                <rect x="-6" y="-2" width="150" height="60" fill="none" stroke="rgba(247,245,239,0.15)" rx="4" />
              </g>
            </svg>
          ),
        },
        {
          title: 'Check Bit 1: (mask & (1 << 1))',
          description: 'Bitwise AND with mask 0010 isolates bit 1: Result = 0010 != 0 (Member is present!).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 20)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1 0 1 1</text>
                <text x="0" y="44" fill="var(--accent)" fontSize="13" fontWeight="800" fontFamily="monospace">&amp; BIT:  0 0 1 0</text>
                <line x1="-5" y1="54" x2="140" y2="54" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
                <text x="0" y="74" fill="#84cc16" fontSize="14" fontWeight="800" fontFamily="monospace">RES  :  0 0 1 0 (TRUE)</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'Set Bit 2: (mask | (1 << 2))',
          description: 'Bitwise OR with 0100 inserts element 2 into set: 1011 | 0100 = 1111 (Decimal 15).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(45, 20)">
                <text x="0" y="20" fill="#9B9A95" fontSize="13" fontFamily="monospace">MASK :  1 0 1 1</text>
                <text x="0" y="44" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="monospace">| SET:  0 1 0 0</text>
                <line x1="-5" y1="54" x2="140" y2="54" stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" />
                <text x="0" y="74" fill="#38bdf8" fontSize="14" fontWeight="800" fontFamily="monospace">NEW  :  1 1 1 1 (15)</text>
              </g>
            </svg>
          ),
        },
      ];

    case 'linked-list':
      return [
        {
          title: 'Initial Node Chain',
          description: 'Head pointer references node 1 -> node 2 -> node 3 -> null.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">H:1</text>
                <path d="M 36 13 L 66 13 L 66 43 L 76 43" fill="none" stroke="var(--accent)" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="94" y="47" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">2</text>
                <path d="M 112 43 L 142 43 L 142 73 L 152 73" fill="none" stroke="rgba(247,245,239,0.5)" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="170" y="77" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:3</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'Traversal: curr = curr.next',
          description: 'Pointer advances to node 2. Next node accessed via explicit pointer dereference.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#9B9A95" fontSize="11" textAnchor="middle" fontFamily="monospace">1</text>
                <path d="M 36 13 L 66 13 L 66 43 L 76 43" fill="none" stroke="rgba(247,245,239,0.3)" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="rgba(214,82,58,0.2)" stroke="var(--accent)" strokeWidth="2" rx="4" />
                <text x="94" y="47" fill="var(--accent)" fontSize="12" fontWeight="800" textAnchor="middle" fontFamily="monospace">2*</text>
                <path d="M 112 43 L 142 43 L 142 73 L 152 73" fill="none" stroke="rgba(247,245,239,0.5)" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="170" y="77" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:3</text>
              </g>
            </svg>
          ),
        },
        {
          title: 'In-Place Reversal',
          description: 'curr.next redirected to prev node in O(1) space. Head becomes Tail.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(24, 30)">
                <rect x="0" y="0" width="36" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
                <text x="18" y="17" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">T:1</text>
                <path d="M 76 43 L 66 43 L 66 13 L 36 13" fill="none" stroke="#38A169" strokeWidth="2" />
                <rect x="76" y="30" width="36" height="26" fill="#141720" stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" rx="4" />
                <text x="94" y="47" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="monospace">2</text>
                <path d="M 152 73 L 142 73 L 142 43 L 112 43" fill="none" stroke="#38A169" strokeWidth="2" />
                <rect x="152" y="60" width="36" height="26" fill="#141720" stroke="var(--accent)" strokeWidth="2" rx="4" />
                <text x="170" y="77" fill="var(--accent)" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="monospace">H:3</text>
              </g>
            </svg>
          ),
        },
      ];

    case 'binary-heap':
      return [
        {
          title: 'Max-Heap Structure',
          description: 'Parent 90 >= children (60, 75). Complete binary tree satisfies heap property.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="25" x2="70" y2="55" />
                <line x1="120" y1="25" x2="170" y2="55" />
                <line x1="70" y1="55" x2="45" y2="88" />
                <line x1="70" y1="55" x2="95" y2="88" />
              </g>
              <circle cx="120" cy="25" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="120" y="29" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">90</text>
              <circle cx="70" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="70" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">60</text>
              <circle cx="170" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="170" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">75</text>
            </svg>
          ),
        },
        {
          title: 'Insert & Sift-Up',
          description: 'New key 95 inserted at leaf and bubbled up past 60 and 90 to become new root.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="25" x2="70" y2="55" stroke="#38A169" strokeWidth="2" />
                <line x1="120" y1="25" x2="170" y2="55" />
              </g>
              <circle cx="120" cy="25" r="10" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="29" fill="#F7F5EF" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">95</text>
              <circle cx="70" cy="55" r="8" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" />
              <text x="70" y="59" fill="var(--accent)" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">90</text>
              <circle cx="170" cy="55" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
              <text x="170" y="59" fill="#06b6d4" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">75</text>
            </svg>
          ),
        },
      ];

    case 'hash-table':
      return [
        {
          title: 'Hash Function: h(k) = k % 5',
          description: 'Key 12 hashes to bucket slot h(12) = 12 % 5 = 2. Placed in O(1) expected time.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(32, 16)">
                <circle cx="18" cy="46" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
                <text x="18" y="50" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">12</text>
                <path d="M 26 46 L 76 46" stroke="var(--accent)" strokeWidth="2" fill="none" />
                <rect x="76" y="16" width="22" height="74" fill="#141720" stroke="rgba(247,245,239,0.25)" rx="4" />
                <text x="87" y="57" fill="#f59e0b" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">%5</text>
                <path d="M 98 46 L 140 46" stroke="#38A169" strokeWidth="2" fill="none" />
                <g transform="translate(142, 8)">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <g key={idx} transform={`translate(0, ${idx * 17})`}>
                      <rect x="0" y="0" width="44" height="14" fill={idx === 2 ? '#38A169' : '#141720'} stroke={idx === 2 ? '#38A169' : 'rgba(247,245,239,0.15)'} strokeWidth="1.5" rx="2" />
                      <text x="22" y="11" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">{idx === 2 ? '12' : ''}</text>
                      <text x="-6" y="11" fill="rgba(247,245,239,0.4)" fontSize="9" textAnchor="end" fontFamily="monospace">{idx}</text>
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          ),
        },
        {
          title: 'Collision Resolution (Linear Probe)',
          description: 'Key 22 hashes to slot 2 (Occupied!). Linear probing stores key in next free slot 3.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g transform="translate(32, 16)">
                <circle cx="18" cy="46" r="8" fill="#E5A93C" stroke="#F7F5EF" strokeWidth="1.5" />
                <text x="18" y="50" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">22</text>
                <path d="M 26 46 L 76 46" stroke="#E5A93C" strokeWidth="2" fill="none" />
                <rect x="76" y="16" width="22" height="74" fill="#141720" stroke="rgba(247,245,239,0.25)" rx="4" />
                <g transform="translate(142, 8)">
                  {[0, 1, 2, 3, 4].map((idx) => (
                    <g key={idx} transform={`translate(0, ${idx * 17})`}>
                      <rect x="0" y="0" width="44" height="14" fill={idx === 2 ? 'rgba(214,82,58,0.3)' : idx === 3 ? '#E5A93C' : '#141720'} stroke={idx === 3 ? '#E5A93C' : 'rgba(247,245,239,0.15)'} strokeWidth="1.5" rx="2" />
                      <text x="22" y="11" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">{idx === 2 ? '12' : idx === 3 ? '22' : ''}</text>
                      <text x="-6" y="11" fill="rgba(247,245,239,0.4)" fontSize="9" textAnchor="end" fontFamily="monospace">{idx}</text>
                    </g>
                  ))}
                </g>
              </g>
            </svg>
          ),
        },
      ];

    case 'binary-search-tree':
      return [
        {
          title: 'Root Comparison',
          description: 'Search for target 40: compare with root 50. Since 40 < 50, branch left.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="28" x2="65" y2="58" stroke="var(--accent)" strokeWidth="2.5" />
                <line x1="120" y1="28" x2="160" y2="58" />
                <line x1="65" y1="58" x2="40" y2="88" />
                <line x1="65" y1="58" x2="105" y2="88" />
              </g>
              <circle cx="120" cy="28" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <text x="120" y="32" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">50</text>
              <circle cx="65" cy="58" r="8" fill="#141720" stroke="#ec4899" strokeWidth="1.5" />
              <text x="65" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">30</text>
              <circle cx="160" cy="58" r="8" fill="#141720" stroke="#ec4899" strokeWidth="1.5" />
              <text x="160" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">70</text>
            </svg>
          ),
        },
        {
          title: 'Target Node Located',
          description: 'Compare 40 with 30: 40 > 30, branch right. Found node 40 in O(log n) time!',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="120" y1="28" x2="65" y2="58" stroke="var(--accent)" strokeWidth="2" />
                <line x1="120" y1="28" x2="160" y2="58" />
                <line x1="65" y1="58" x2="105" y2="88" stroke="#38A169" strokeWidth="2.5" />
              </g>
              <circle cx="120" cy="28" r="9" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <text x="120" y="32" fill="#9B9A95" fontSize="9" textAnchor="middle" fontFamily="monospace">50</text>
              <circle cx="65" cy="58" r="8" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <text x="65" y="62" fill="#9B9A95" fontSize="9" textAnchor="middle" fontFamily="monospace">30</text>
              <circle cx="105" cy="88" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="105" y="92" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">40</text>
            </svg>
          ),
        },
      ];

    case 'graph-traversal':
      return [
        {
          title: 'BFS: Start Vertex 0',
          description: 'Queue = [0]. Mark start vertex 0 as visited (highlighted).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" />
                <line x1="80" y1="35" x2="50" y2="85" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="160" cy="35" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="50" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="190" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Explore Neighbors: [1, 2]',
          description: 'Dequeue 0. Enqueue adjacent vertices 1 and 2 at depth level 1.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="80" y1="35" x2="50" y2="85" stroke="#6366f1" strokeWidth="2.5" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="8" fill="#141720" stroke="#38A169" strokeWidth="2" />
              <circle cx="160" cy="35" r="8" fill="#6366f1" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="50" cy="85" r="8" fill="#6366f1" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="190" cy="85" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Complete BFS Traversal',
          description: 'All vertices discovered in layer-by-layer order [0, 1, 2, 3, 4] in O(V + E).',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2" fill="none">
                <line x1="80" y1="35" x2="160" y2="35" />
                <line x1="80" y1="35" x2="50" y2="85" />
                <line x1="160" y1="35" x2="190" y2="85" />
                <line x1="50" y1="85" x2="120" y2="105" />
              </g>
              <circle cx="80" cy="35" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="160" cy="35" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="50" cy="85" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="190" cy="85" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="105" r="8" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
      ];

    case 'min-spanning-tree':
      return [
        {
          title: 'Sorted Edges by Weight',
          description: 'Edges: (A,B:1), (B,C:2), (C,D:3), (A,D:4). Kruskal greedy loop begins.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
                <line x1="60" y1="35" x2="180" y2="35" />
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
                <line x1="60" y1="95" x2="60" y2="35" />
              </g>
              <circle cx="60" cy="35" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="180" cy="35" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="180" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="60" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Add Lightest Edge (w=1)',
          description: 'Edge (A, B) with weight 1 added to MST. Sets {A} and {B} merged.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
                <line x1="60" y1="95" x2="60" y2="35" />
              </g>
              <line x1="60" y1="35" x2="180" y2="35" stroke="#ea580c" strokeWidth="3" />
              <circle cx="60" cy="35" r="8" fill="#ea580c" stroke="#F7F5EF" />
              <circle cx="180" cy="35" r="8" fill="#ea580c" stroke="#F7F5EF" />
              <circle cx="180" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
              <circle cx="60" cy="95" r="7" fill="#141720" stroke="#ea580c" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'MST Complete (V-1 Edges)',
          description: 'Edges (A,B), (B,C), (C,D) form minimal spanning tree with zero cycles.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#ea580c" strokeWidth="3" fill="none">
                <line x1="60" y1="35" x2="180" y2="35" />
                <line x1="180" y1="35" x2="180" y2="95" />
                <line x1="180" y1="95" x2="60" y2="95" />
              </g>
              <line x1="60" y1="95" x2="60" y2="35" stroke="rgba(247,245,239,0.15)" strokeDasharray="3,3" strokeWidth="1.5" />
              <circle cx="60" cy="35" r="8" fill="#ea580c" />
              <circle cx="180" cy="35" r="8" fill="#ea580c" />
              <circle cx="180" cy="95" r="8" fill="#ea580c" />
              <circle cx="60" cy="95" r="8" fill="#ea580c" />
            </svg>
          ),
        },
      ];

    case 'ss-shortest-paths':
      return [
        {
          title: 'Dijkstra Source Setup',
          description: 'Source S has dist[S] = 0; all other vertices initialized to ∞.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" />
                <line x1="50" y1="65" x2="120" y2="95" />
                <line x1="120" y1="35" x2="190" y2="65" />
                <line x1="120" y1="95" x2="190" y2="65" />
              </g>
              <circle cx="50" cy="65" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
              <circle cx="120" cy="35" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="120" cy="95" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
              <circle cx="190" cy="65" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Edge Relaxation: dist[u] + w < dist[v]',
          description: 'Relaxing neighbors of S: dist[A] = 2, dist[B] = 5.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" stroke="#10b981" strokeWidth="2.5" />
                <line x1="50" y1="65" x2="120" y2="95" stroke="#10b981" strokeWidth="2.5" />
                <line x1="120" y1="35" x2="190" y2="65" />
                <line x1="120" y1="95" x2="190" y2="65" />
              </g>
              <circle cx="50" cy="65" r="8" fill="var(--accent)" stroke="#F7F5EF" />
              <circle cx="120" cy="35" r="8" fill="#10b981" stroke="#F7F5EF" />
              <circle cx="120" cy="95" r="8" fill="#10b981" stroke="#F7F5EF" />
              <circle cx="190" cy="65" r="7" fill="#141720" stroke="rgba(247,245,239,0.4)" />
            </svg>
          ),
        },
        {
          title: 'Shortest Path Tree Established',
          description: 'Optimal path to destination T found with total minimal cost = 6.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#10b981" strokeWidth="2.5" fill="none">
                <line x1="50" y1="65" x2="120" y2="35" />
                <line x1="120" y1="35" x2="190" y2="65" />
              </g>
              <line x1="50" y1="65" x2="120" y2="95" stroke="rgba(247,245,239,0.2)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="50" cy="65" r="8" fill="var(--accent)" />
              <circle cx="120" cy="35" r="8" fill="#10b981" />
              <circle cx="190" cy="65" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
            </svg>
          ),
        },
      ];

    case 'cycle-finding':
      return [
        {
          title: 'Floyd Pointer Setup',
          description: 'Tortoise (slow, speed=1) and Hare (fast, speed=2) both begin at list head.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#06b6d4" strokeWidth="2" />
              </g>
              <circle cx="45" cy="85" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <text x="45" y="89" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle">S</text>
            </svg>
          ),
        },
        {
          title: 'Hare Laps Inside Cycle',
          description: 'Fast pointer loops through cycle twice as quickly as Slow pointer.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#06b6d4" strokeWidth="2" />
              </g>
              <circle cx="135" cy="70" r="7" fill="var(--accent)" stroke="#F7F5EF" />
              <text x="135" y="74" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">S</text>
              <circle cx="185" cy="70" r="7" fill="#38A169" stroke="#F7F5EF" />
              <text x="185" y="74" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">F</text>
            </svg>
          ),
        },
        {
          title: 'Collision Detected (Cycle Found!)',
          description: 'Slow == Fast inside the loop! Cycle detected in O(n) time and O(1) extra memory.',
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="2" fill="none">
                <line x1="45" y1="85" x2="85" y2="55" />
                <line x1="85" y1="55" x2="125" y2="45" />
                <circle cx="160" cy="70" r="25" stroke="#38A169" strokeWidth="2.5" />
              </g>
              <circle cx="160" cy="45" r="9" fill="#38A169" stroke="#F7F5EF" strokeWidth="2" />
              <text x="160" y="49" fill="#F7F5EF" fontSize="8" fontWeight="900" textAnchor="middle">S=F</text>
            </svg>
          ),
        },
      ];

    default:
      // Generic animated step sequence for remaining advanced topics
      return [
        {
          title: 'Algorithm Setup & State',
          description: `Initial data representation and graph/tree topology prepared in memory.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="rgba(247,245,239,0.3)" strokeWidth="1.5" fill="none">
                <line x1="60" y1="40" x2="120" y2="30" />
                <line x1="120" y1="30" x2="180" y2="50" />
                <line x1="180" y1="50" x2="150" y2="95" />
                <line x1="150" y1="95" x2="70" y2="90" />
                <line x1="70" y1="90" x2="60" y2="40" />
              </g>
              <circle cx="60" cy="40" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="120" cy="30" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="180" cy="50" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="150" cy="95" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
              <circle cx="70" cy="90" r="6" fill="#141720" stroke={themeColor} strokeWidth="1.5" />
            </svg>
          ),
        },
        {
          title: 'Processing & Invariant Check',
          description: `Core algorithm loop executing operations according to invariant rules.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke={themeColor} strokeWidth="2" fill="none">
                <line x1="60" y1="40" x2="120" y2="30" />
                <line x1="120" y1="30" x2="180" y2="50" />
              </g>
              <g stroke="rgba(247,245,239,0.2)" strokeWidth="1" strokeDasharray="3,3" fill="none">
                <line x1="180" y1="50" x2="150" y2="95" />
                <line x1="150" y1="95" x2="70" y2="90" />
                <line x1="70" y1="90" x2="60" y2="40" />
              </g>
              <circle cx="60" cy="40" r="7" fill={themeColor} stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="30" r="7" fill={themeColor} stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="50" r="7" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="150" cy="95" r="5" fill="#141720" stroke="rgba(247,245,239,0.4)" />
              <circle cx="70" cy="90" r="5" fill="#141720" stroke="rgba(247,245,239,0.4)" />
            </svg>
          ),
        },
        {
          title: 'Solution Reached / Converged',
          description: `All criteria verified. Optimal result or structure fully constructed.`,
          render: () => (
            <svg width="100%" height="100%" viewBox="0 0 240 130">
              <g stroke="#38A169" strokeWidth="2.5" fill="none">
                <polygon points="60,40 120,30 180,50 150,95 70,90" fill="rgba(56,161,105,0.12)" />
              </g>
              <circle cx="60" cy="40" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="120" cy="30" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="180" cy="50" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="150" cy="95" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
              <circle cx="70" cy="90" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
            </svg>
          ),
        },
      ];
  }
}
