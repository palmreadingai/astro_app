import { Section } from '../types/palmTypes';

export const palmQuestions: Section[] = [
  {
    id: 'handType',
    title: 'Hand Type Classification',
    description: 'Basic hand shape and elemental type assessment',
    questions: [
      {
        id: 'elementalType',
        type: 'single',
        question: 'Select hand type',
        options: [
          'Earth Hand: Square palm with short fingers',
          'Air Hand: Square palm with long fingers',
          'Fire Hand: Oblong palm with short fingers',
          'Water Hand: Oblong palm with long fingers'
        ],
        images: [
          '/images/palm-reading/2_Hand_Type_Classification/1_Earth_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/2_Air_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/3_Fire_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/4_Water_Hand.webp'
        ]
      },
      {
        id: 'detailedType',
        type: 'single',
        question: 'Select hand nature',
        options: [
          'Elementary: Clumsy, stubby fingers, coarse skin',
          'Practical: Square palm, longer fingers',
          'Spatulate: Fingertips flare out, energetic',
          'Conic: Graceful and curved with rounded fingertips',
          'Psychic: Long, slender, and very graceful',
          'Philosophical: Square with long fingers and obvious joints',
          'Mixed: Combination of multiple types'
        ],
        images: [
          '/images/palm-reading/2_Hand_Type_Classification/5_Elementary_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/6_Practical_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/7_Spatulate_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/8_Conic_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/9_Psychic_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/10_Philosophical_Hand.webp',
          '/images/palm-reading/2_Hand_Type_Classification/11_Mixed_Hand.webp'
        ]
      }
    ]
  },
  {
    id: 'physical',
    title: 'Physical Hand Characteristics',
    description: 'Skin texture, flexibility, and color assessment',
    questions: [
      {
        id: 'skinTexture',
        type: 'single',
        question: 'How would you describe the skin texture on the back of your hand?',
        options: [
          'Fine and smooth',
          'Medium texture',
          'Rough and coarse'
        ]
      },
      {
        id: 'palmConsistency',
        type: 'single',
        question: 'When you press gently on your palm, how does it feel?',
        options: [
          'Soft and spongy',
          'Medium soft',
          'Hard and rigid'
        ]
      },
      {
        id: 'handFlexibility',
        type: 'single',
        question: 'How flexible is your hand when you bend it backward?',
        options: [
          'Very flexible (bends back easily past 90 degrees)',
          'Moderately flexible (bends back to about 90 degrees)',
          'Rigid (hardly bends back at all)'
        ]
      },
      {
        id: 'handSize',
        type: 'single',
        question: 'How would you describe your hand size relative to your body?',
        options: [
          'Large (proportionally big for your body)',
          'Medium (proportional to your body)',
          'Small (proportionally small for your body)'
        ]
      },
      {
        id: 'palmColor',
        type: 'single',
        question: 'What is the usual color of your palm (at normal room temperature)?',
        options: [
          'White/Very pale',
          'Pink (healthy pink color)',
          'Red (reddish tinge indicating high energy)',
          'Yellow (yellowish tinge)',
          'Blue (bluish tinge)'
        ]
      }
    ]
  },
  {
    id: 'quadrants',
    title: 'Four Quadrants Analysis',
    description: 'Energy distribution across palm sections',
    questions: [
      {
        id: 'quadrantDevelopment',
        type: 'single',
        question: 'Looking at your hand divided into four sections, which quadrant appears most prominent or developed?',
        questionImage: '/images/palm-reading/3_refined_hand_analysis/1_The_Four_Quadrants.webp',
        options: [
          '1 Active-Outer (thumb area and index finger area)',
          '2 Passive-Outer (base of thumb and mount below)',
          '3 Active-Inner (ring and little fingers area)',
          '4 Passive-Inner (opposite side from thumb)',
          '5 All quadrants appear equally balanced'
        ]
      }
    ]
  },
  {
    id: 'majorLines',
    title: 'Major Lines Assessment',
    description: 'Analysis of heart, head, life, and destiny lines',
    questions: [
      {
        id: 'heartLineEnding',
        type: 'single',
        question: 'Where you heart line ends?',
        options: [
          'Physical Heart Line',
          'Mental Heart Line',
          'Heart Line Ending Below Second Finger',
          'Heart Line Ending Between First and Second Fingers'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/1.1 Physical_Heart_Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/1.2 Mental_Heart_Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/1.3 Heart_Line_Ending_Below_Second_Finger.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/1.4 Heart_Line_Ending_Between_First_and_Second_Fingers.webp'
        ]
      },
      {
        id: 'heartLineFeatures',
        type: 'multiple',
        question: 'Which features are present in your heart line',
        options: [
          'Chained Heart Line',
          'Double Heart Line',
          'Forked Heart Line',
          'Girdle of Venus',
          'Heart Line with Islands',
          'Lasting Relationship'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.1 Chained Heart Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.2 Double Heart Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.3 Forked Heart Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.4 Girdle of Venus.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.5 Heart Line with Islands.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/heart_lines/2.6 Lasting Relationship.webp'
        ]
      },
      {
        id: 'headLineStart',
        type: 'single',
        question: 'Where you head line start?',
        options: [
          'Head line attached to Life Line at the start',
          'Head Line Joined to Life Line',
          'Head Line starting apart from Life Line',
          'Head Line starting in mount of jupiter',
          'Head Line starting inside the life line'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/1.1 Head line attached to Life Line at the start.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/1.2 Head Line Joined to Life Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/1.3 Head Line starting apart from Life Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/1.4 Head Line starting in mount of jupiter.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/1.5 Head Line starting inside the life line.webp'
        ]
      },
      {
        id: 'headLineLength',
        type: 'single',
        question: 'How long is your head line?',
        options: [
          'Short',
          'Average length',
          'Long',
          'Very Long'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/2.1 Short Head line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/2.2 Average length Head line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/2.3 LongHead line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/2.4 Very Long Head line.webp'
        ]
      },
      {
        id: 'headLineType',
        type: 'multiple',
        question: 'What type of head line do you have?',
        options: [
          'Straight across palm',
          'Curved downward toward wrist',
          'Forked at the end',
          'Break in Head line',
          'Distinct Bend at the end'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/3.1 Straight.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/3.2 Curved.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/3.3 Writer_s Fork.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/3.4 Break in Head line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/head_lines/3.5 Distinct Bend.webp'
        ]
      },
      {
        id: 'lifeLineCourse',
        type: 'single',
        question: 'Describe the course of your life line:',
        options: [
          'Makes a wide sweep across palm',
          'Hugs close to the thumb',
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/life_line/1.1 Life_Line_Coming_Well_Across_Palm.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/life_line/1.2 Life_Line_Hugs_Thumb.webp',
        ]
      },
      {
        id: 'lifeLineFeatures',
        type: 'multiple',
        question: 'Which features are present in your life line?',
        options: [
          'Sister Line (Line of Mars)',
          'Square',
          'Break on life line'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/life_line/2.1 Sister_Line_Line_of_Mars.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/life_line/2.2 Square.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/life_line/2.3 Break on life line.webp'
        ]
      },
      {
        id: 'hasDestinyLine',
        type: 'single',
        question: 'Do you have a line running vertically up the center/middle of your palm (destiny line)?',
        questionImage: '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/18_Destiny_Line_Starting_Away_from_Life_Line_Independent_Outlook.webp',
        options: ['Yes', 'No']
      },
      {
        id: 'destinyLineStart',
        type: 'single',
        question: 'Where does your destiny line start?',
        options: [
          'Destiny Line Starting Well across the Palm',
          'Destiny Line Starting Early In Life'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/1.1 Destiny Line Starting Well across the Palm.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/1.2 Destiny Line Strating Early In Life.webp'
        ]
      },
      {
        id: 'destinyLineEnd',
        type: 'single',
        question: 'Where does your destiny line end?',
        options: [
          'Destiny Line Ending in Trident',
          'Destiny Line Ending Under First Finger',
          'Destiny Line Ending Under Fourth Finger',
          'Destiny Line Ending Under Second Finger',
          'Destiny Line Ending Under third Finger'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/2.1 Destiny Line Ending in Trident.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/2.2 Destiny Line Ending Under First Finger.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/2.3 Destiny Line Ending Under Fourth Finger.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/2.4 Destiny Line Ending Under Second Finger.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/2.5 Destiny Line Ending Under third  Finger.webp'
        ]
      },
      {
        id: 'destinyLineFeatures',
        type: 'multiple',
        question: 'Which features are present in your destiny line?',
        options: [
          'Break in Destiny Line',
          'Destiny Line Touching Life Line',
          'Destiny Line Attached to life Line',
          'Double Destiny Line',
          'Square In Destiny Line (around a break)',
          'Square In Destiny Line (not around a break)'
        ],
        images: [
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.1 Break in Destiny Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.2 Destiny Line Touching Life Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.3 Destiny Lne Attached to life Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.4 Double Destiny Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.5 Protective Square In Destiny Line.webp',
          '/images/palm-reading/4_Major_Lines_Assessment/destiny_line/3.6 Unprotective Square In Destiny Line.webp'
        ]
      },
      {
        id: 'worryLines',
        type: 'single',
        question: 'Number of worry lines coming from your thumb toward the life line?',
        questionImage: '/images/palm-reading/4_Major_Lines_Assessment/15_Worry_Lines.webp',
        options: [
          'Many lines',
          'Few lines',
          'No to minimal lines'
        ]
      },
    ]
  },
  {
    id: 'minorLines',
    title: 'Minor Lines & Special Features',
    description: 'Additional lines and special markings',
    questions: [
      {
        id: 'additionalLines',
        type: 'multiple',
        question: 'Which minor lines you have?',
        questionImage: '/images/palm-reading/6_Minor_Lines_Special_Marks/1_The_Minor_Lines.webp',
        options: [
          'A. Girdle of Venus',
          'B. Hepatica',
          'C. Sun Line',
          'D. Ring of Solomon',
          'E. Sympathy Line',
          'F. Rascettes',
          'G. Via Lasciva',
          'H. Medical Stigmata',
          'I. Family Chain',
          'J. Relationship Lines',
          'K. Children Lines',
          'L. Travel Lines',
          'M. Intuition Line'
        ]
      },
      {
        id: 'simianCrease',
        type: 'single',
        question: 'Do you have a simian crease (heart and head line merge at end and becomes single line)?',
        questionImage: '/images/palm-reading/6_Minor_Lines_Special_Marks/2_Simian_Crease_Head_and_Heart_Lines_Combined.webp',
        options: [
          'Yes',
          'No'
        ]
      }
    ]
  },
  {
    id: 'fingers',
    title: 'Fingers Analysis',
    description: 'Finger setting and characteristics',
    questions: [
      {
        id: 'stressLines',
        type: 'single',
        question: 'Number of stress/strain lines on your fingers?',
        questionImage: '/images/palm-reading/7_Fingers/1_Stress_and_Strain_Lines.webp',
        options: [
          'Many lines',
          'Few lines',
          'No to minimal lines'
        ]
      },
      {
        id: 'fingerSetting',
        type: 'single',
        question: 'How are your fingers set across your hand?',
        options: [
          'Set on curved arch',
          'Set on tented arch'
        ],
        images: [
          '/images/palm-reading/7_Fingers/2_Fingers_Set_on_Curved_Arch_Well_Balanced_Person.webp',
          '/images/palm-reading/7_Fingers/3_Fingers_Set_on_Tented_Arch_Lack_of_Confidence.webp'
        ]
      },
      {
        id: 'fingertipShapes',
        type: 'single',
        question: 'What shape are most of your fingertips?',
        options: [
          'Square tips',
          'Conic (rounded) tips',
          'Spatulate tips'
        ],
        images: [
          '/images/palm-reading/12_others/3_finger_tip_square.webp',
          '/images/palm-reading/12_others/1_finger_tip_conic.webp',
          '/images/palm-reading/12_others/2_finger_tip_spatulate.webp'
        ]
      }
    ]
  },
  {
    id: 'mounts',
    title: 'Mounts Assessment',
    description: 'Raised areas below fingers and on palm',
    questions: [
      {
        id: 'developedMounts',
        type: 'multiple',
        question: 'Which areas below your fingers and on your palm appear raised or well-developed? (Check all that apply)',
        questionImage: '/images/palm-reading/9_mounts/1_The_Mounts.webp',
        options: [
          'A. Mount of Jupiter',
          'B. Mount of Saturn',
          'C. Mount of Apollo',
          'D. Mount of Mercury',
          'E. Mount of Venus',
          'F. Mount of Inner Mars',
          'G. Mount of Outer Mars',
          'H. Mount of Luna',
          'I. Mount of Neptune'
        ]
      }
    ]
  },
  {
    id: 'fingerprints',
    title: 'Fingerprint Patterns & Specialized Features',
    description: 'Pattern analysis and identification',
    questions: [
      {
        id: 'fingerprintPattern',
        type: 'single',
        question: 'What type of fingerprint pattern do you have most commonly on your fingertips?',
        options: [
          'Loops (lines that curve around)',
          'Whorls (circular or spiral patterns)',
          'Arches (lines that go up and over like hills)'
        ],
        images: [
          '/images/palm-reading/12_others/1_Three_Main_Types_of_Fingerprint_Patterns_loop.webp',
          '/images/palm-reading/12_others/2_Three_Main_Types_of_Fingerprint_Patterns_whirl.webp',
          '/images/palm-reading/12_others/3_Three_Main_Types_of_Fingerprint_Patterns_arch.webp'
        ]
      }
    ]
  },
  {
    id: 'comparison',
    title: 'Hand Comparison & Final Assessment',
    description: 'Left vs right hand analysis and personality correlations',
    questions: [
      {
        id: 'handComparison',
        type: 'single',
        question: 'How do your left and right hands compare overall?',
        options: [
          'Very similar',
          'Little different',
          'Dramatically different'
        ]
      },
      {
        id: 'dominantHand',
        type: 'single',
        question: 'Which hand do you use for writing and detailed work?',
        options: [
          'Right hand (right-handed)',
          'Left hand (left-handed)',
          'Both equally (ambidextrous)'
        ]
      }
    ]
  }
];