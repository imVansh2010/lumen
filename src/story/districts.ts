export type StationIcon = 'sort' | 'truth' | 'order' | 'vault'

export interface Station {
  id: 1 | 2 | 3 | 4
  name: string
  lesson: string
  blurb: string
  /** Shown while the station is still locked. */
  hint: string
  icon: StationIcon
}

export const STATIONS: Station[] = [
  {
    id: 1,
    name: 'The Sorting Yard',
    lesson: 'Data & Training',
    blurb: 'Fix wrong labels, sort by what things really are, and clean up the example sets.',
    hint: '',
    icon: 'sort',
  },
  {
    id: 2,
    name: 'Signal Square',
    lesson: 'Truth & Checking',
    blurb: 'Help Bolt check a claim before he believes it — and spot rumours.',
    hint: 'Light up every light in District 1 to open this station.',
    icon: 'truth',
  },
  {
    id: 3,
    name: 'Word Workshop',
    lesson: 'Clear Instructions',
    blurb: 'Learn to give clear, kind commands instead of confusing ones.',
    hint: 'Light up District 2 first.',
    icon: 'order',
  },
  {
    id: 4,
    name: 'Vault Gate',
    lesson: 'Privacy & Safety',
    blurb: 'Keep private things private and safe.',
    hint: 'Light up District 3 first.',
    icon: 'vault',
  },
]

/** Station ids in journey order — the shape of the whole progression. */
export const STATION_IDS = STATIONS.map((s) => s.id)
