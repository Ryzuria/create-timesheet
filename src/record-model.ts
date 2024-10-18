export interface CheckoutRecord {
    id: number
    status: string
    visible_to_clients: boolean
    created_at: string
    updated_at: string
    title: string
    inherits_status: boolean
    type: string
    url: string
    app_url: string
    bookmark_url: string
    subscription_url: string
    comments_count: number
    comments_url: string
    parent: Parent
    bucket: Bucket
    creator: Creator
    content: string
    group_on: string
  }
  
  export interface Parent {
    id: number
    title: string
    type: string
    url: string
    app_url: string
  }
  
  export interface Bucket {
    id: number
    name: string
    app_url: string
    type: string
  }
  
  export interface Creator {
    id: number
    attachable_sgid: string
    name: string
    email_address: string
    personable_type: string
    title: string
    bio: string
    location: string
    created_at: string
    updated_at: string
    admin: boolean
    owner: boolean
    client: boolean
    employee: boolean
    time_zone: string
    avatar_url: string
    avatar_kind: string
    company: Company
    can_ping: boolean
    can_manage_projects: boolean
    can_manage_people: boolean
    can_access_timesheet: boolean
  }
  
  export interface Company {
    id: number
    name: string
  }
  