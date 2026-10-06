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
    blurb: 'Fix wrong labels and clean up messy examples.',
    hint: '',
    icon: 'sort',
  },
  {
    id: 2,
    name: 'Signal Square',
    lesson: 'Truth & Checking',
    blurb: 'Check a claim before you believe it.',
    hint: 'Light up District 1 first.',
    icon: 'truth',
  },
  {
    id: 3,
    name: 'Word Workshop',
    lesson: 'Clear Instructions',
    blurb: 'Give clear instructions, not ones that get misread.',
    hint: 'Light up District 2 first.',
    icon: 'order',
  },
  {
    id: 4,
    name: 'Vault Gate',
    lesson: 'Privacy & Safety',
    blurb: 'Keep private things private and your codes secret.',
    hint: 'Light up District 3 first.',
    icon: 'vault',
  },
]

/** Station ids in journey order — the shape of the whole progression. */
export const STATION_IDS = STATIONS.map((s) => s.id)
