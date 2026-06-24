export type Lang = 'en' | 'zh';

export const translations = {
  en: {
    // Nav
    nav_world: 'World',
    nav_trips: 'Trips',
    nav_restaurants: 'Restaurants',
    nav_hotels: 'Hotels',
    nav_notifications: 'Notifications',
    nav_future_plan: 'Future Plan',
    nav_settings: 'Settings',
    nav_sign_out: 'Sign out',

    // Auth
    auth_sign_in: 'Sign in',
    auth_create_account: 'Create account',
    auth_continue_google: 'Continue with Google',
    auth_email_placeholder: 'Email address',
    auth_password_placeholder: 'Password',
    auth_check_email: 'Check your email',
    auth_sent_link: 'We sent a confirmation link to',

    // Stats
    stats_trips: 'Trips',
    stats_countries_cities: 'Countries / Cities',
    stats_hotels_nights: 'Hotels / Nights',
    stats_restaurants: 'Restaurants',
    stats_total_expense: 'Total Expense',

    // Trips page
    trips_title: 'Our Trips',
    trips_search_placeholder: 'Search trips, cities…',
    trips_no_match_hint: 'Try a different destination or trip name',
    trips_empty: 'No trips logged yet',
    trips_empty_hint: 'Click + button to add your first trip',
    trip_edit: 'Edit trip',
    trip_share: 'Share trip',
    trip_delete: 'Delete trip',
    trip_leave: 'Leave trip',
    trip_confirm_delete: 'Delete this trip?',
    trip_confirm_leave: 'Leave this trip?',

    // Restaurants page
    restaurants_title: 'Our Dinings',
    restaurants_search_placeholder: 'Search restaurants…',
    restaurants_no_match_hint: 'Try a different restaurant name, cuisine, city, or country',
    restaurants_empty: 'No restaurants logged yet',
    restaurants_empty_hint: 'Click + button to add your first dining log',
    restaurant_confirm_delete: 'Delete this restaurant?',
    restaurant_confirm_leave: 'Leave this restaurant?',

    // Hotels page
    hotels_title: 'Our Stays',
    hotels_search_placeholder: 'Search hotels…',
    hotels_no_match_hint: 'Try a different hotel name, city, or country',
    hotels_empty: 'No hotels logged yet',
    hotels_empty_hint: 'Click + button to add your first stay',
    hotel_confirm_delete: 'Delete this hotel?',
    hotel_confirm_leave: 'Leave this hotel?',

    // Common actions
    common_edit: 'Edit',
    common_share: 'Share',
    common_delete: 'Delete',
    common_leave: 'Leave',
    common_cancel: 'Cancel',
    common_save: 'Save',
    common_add: 'Add',
    common_remove: 'Remove',

    // Sort
    sort_by: 'Sort by',
    sort_newest: 'Newest Date',
    sort_oldest: 'Oldest Date',
    sort_highest_rating: 'Highest Rating',
    sort_lowest_rating: 'Lowest Rating',

    // FAB
    fab_trip: 'Trip',
    fab_restaurant: 'Restaurant',
    fab_hotel: 'Hotel',

    // Settings
    settings_title: 'Settings',
    settings_general: 'General',
    settings_demo_mode: 'Demo Mode',
    settings_appearance: 'Appearance',
    settings_appearance_system: 'System',
    settings_appearance_light: 'Light',
    settings_appearance_dark: 'Dark',
    settings_language: 'Language',
    settings_help: 'Help',
    settings_contact_support: 'Contact Support',
    settings_about: 'About',
    settings_share_app: "Share LET'S GO",
    settings_copied: 'Copied!',
    settings_privacy: 'Privacy Policy',
    settings_terms: 'Terms of Service',

    // Notifications
    notif_title: 'Notifications',
    notif_empty: 'No pending invitations.',
    notif_pending: 'Pending Invitations',
    notif_invited: 'invited you',
    notif_accept: 'Accept',
    notif_decline: 'Decline',

    // Future Plans
    plan_title: 'Future Plans',
    plan_my_plans: 'My Plans',
    plan_empty: 'No plans yet. Add your first one!',
    plan_add: 'Add a plan',
    plan_title_ph: 'Plan title',
    plan_notes_ph: 'Notes (optional)',
    plan_title_input: 'Plan title...',
    plan_notes_input: 'Notes (optional)...',
    plan_type_trip: 'Trip',
    plan_type_dining: 'Dining',
    plan_type_hotel: 'Hotel',

    // Collaborator modal
    collab_invite_ph: 'Invite by email…',
    collab_results: 'Results',
    collab_already_added: 'Already added',
    collab_invite: 'Invite',
    collab_not_found: 'No account found with that email.',
    collab_has_access: 'Has Access',
    collab_loading: 'Loading…',
    collab_you: ' (you)',
    collab_owner: 'Owner',
    collab_no_collab: 'No collaborators yet.',
    collab_awaiting: 'Awaiting Response',
    collab_pending: 'Pending',
    collab_remove: 'Remove',

    // What's New
    new_title: "What's New",
    new_version: 'Version',
    new_latest: 'Latest',

    // Calendar / address search
    calendar_placeholder: 'MM/DD/YYYY',
    address_search_placeholder: 'Search address or place name…',

    // Form shared
    form_required: '(required)',
    form_cover_photo: 'Cover Photo',
    form_click_upload: 'Click to upload',
    form_rating: 'Rating',
    form_total_expense: 'Total Expense',
    form_add_to_trip: 'Add to Trip',
    form_select_trip: 'Select a trip…',
    form_select: 'Select…',
    form_address: 'Address',
    form_save_draft: 'Save Draft',
    form_save_changes: 'Save Changes',
    form_changes_saved: 'Changes Saved',
    form_draft_saved: 'Draft Saved',
    form_date: 'Date',

    // Trip modal
    trip_modal_name_ph: 'e.g. Tokyo, Japan (Summer 2025)',
    trip_modal_city_ph: 'e.g. Tokyo',
    trip_modal_country_ph: 'e.g. Japan',
    trip_modal_edit: 'Edit Trip',
    trip_modal_add: 'Add a Trip',
    trip_modal_name: 'Trip Name',
    trip_modal_city: 'City',
    trip_modal_country: 'Country',
    trip_modal_start_date: 'Start Date',
    trip_modal_end_date: 'End Date',
    trip_modal_highlights: 'Highlight Photos',
    trip_modal_add_photos: 'Click to add photos (0/20)',
    trip_modal_upload_cover: 'Click to upload cover',
    trip_modal_created: 'Trip Created',
    trip_modal_create: 'Create Trip',

    // Restaurant modal
    rest_modal_name_ph: 'e.g. Izumo Ikebukuro',
    rest_modal_cuisine_ph: 'e.g. Japanese',
    rest_modal_edit: 'Edit Restaurant',
    rest_modal_add: 'Add a Restaurant',
    rest_modal_name: 'Restaurant Name',
    rest_modal_cuisine: 'Cuisine',
    rest_modal_meal: 'Meal Type',
    rest_modal_michelin: 'Michelin Stars',
    rest_modal_michelin_none: 'None',
    rest_modal_created: 'Restaurant Added',
    rest_modal_create: 'Add Restaurant',

    // Meal options (English values kept in DB; only display is translated)
    meal_breakfast: 'Breakfast',
    meal_brunch: 'Brunch',
    meal_lunch: 'Lunch',
    meal_afternoon_tea: 'Afternoon Tea',
    meal_dinner: 'Dinner',
    meal_late_night: 'Late Night',

    // Hotel card
    hotel_nights: 'night',
    hotel_nights_plural: 'nights',
    hotel_per_night: '/ night',

    // Hotel modal
    hotel_modal_name_ph: 'e.g. Aman Tokyo',
    hotel_modal_edit: 'Edit Hotel',
    hotel_modal_add: 'Add a Hotel',
    hotel_modal_name: 'Hotel Name',
    hotel_modal_checkin: 'Check-in',
    hotel_modal_checkout: 'Check-out',
    hotel_modal_room_type: 'Room Type',
    hotel_modal_view_type: 'View Type',
    hotel_modal_created: 'Hotel Added',
    hotel_modal_create: 'Add Hotel',

    // Room & view types (values kept in English; only display is translated)
    room_villa: 'Villa',
    room_suite: 'Suite',
    room_king: 'King',
    room_queen: 'Queen',
    room_twin: 'Twin',
    room_studio: 'Studio',
    view_city: 'City View',
    view_ocean: 'Ocean View',
    view_lake: 'Lake View',
    view_river: 'River View',
    view_mountain: 'Mountain View',
    view_garden: 'Garden View',
    view_park: 'Park View',
    view_no_view: 'No View',

    // Trip detail
    detail_highlights: 'Highlights',
    detail_restaurants: 'Restaurants',
    detail_hotels: 'Hotels',
    detail_upload_photos: 'Upload trip photos',
    detail_upload_hint: 'Click to select · 20 images supported',
    detail_add_photos: 'Add photos',
    detail_no_restaurants: 'No restaurants logged yet. Click + button to add meals.',
    detail_no_hotels: 'No hotels logged yet. Click + button to add stays.',

    // World Map
    world_footprint: 'World Footprint',
    world_map_dining: 'Dining',
    world_map_hotel: 'Hotel',

    // Loading
    loading: 'Loading',
    loading_stuck: 'This is taking longer than expected.',
    loading_reload: 'Reload',

    // Language names
    lang_english: 'English',
    lang_chinese: 'Chinese',

    // Drawers
    common_done: 'Done',
    drawer_date_time: 'Date & Time',
    drawer_our_dishes: 'Our Dishes',
    drawer_dish: 'dish',
    drawer_dishes: 'dishes',
    drawer_add_dish: 'Add a dish',
    drawer_dish_name_ph: 'Dish name',
    drawer_notes_ph: 'Notes (optional)',
    drawer_photo: 'Photo',
    dish_appetizer: 'Appetizer',
    dish_mains: 'Mains',
    dish_dessert: 'Dessert',
    dish_drinks: 'Drinks',
    dish_snack: 'Snack',
    hotel_drawer_duration: 'Duration',
    hotel_drawer_notes: 'Notes',
    hotel_drawer_note_ph: 'Add a note…',
    hotel_drawer_no_notes: 'No notes yet.',
  },
  zh: {
    // Nav
    nav_world: '世界',
    nav_trips: '旅行',
    nav_restaurants: '餐厅',
    nav_hotels: '酒店',
    nav_notifications: '通知',
    nav_future_plan: '未来计划',
    nav_settings: '设置',
    nav_sign_out: '退出登录',

    // Auth
    auth_sign_in: '登录',
    auth_create_account: '创建账号',
    auth_continue_google: '使用 Google 继续',
    auth_email_placeholder: '邮箱地址',
    auth_password_placeholder: '密码',
    auth_check_email: '请查看您的邮箱',
    auth_sent_link: '我们已向以下地址发送了确认链接',

    // Stats
    stats_trips: '旅行',
    stats_countries_cities: '国家 / 城市',
    stats_hotels_nights: '酒店 / 晚数',
    stats_restaurants: '餐厅',
    stats_total_expense: '总消费',

    // Trips page
    trips_title: '旅行',
    trips_search_placeholder: '搜索旅行、城市…',
    trips_no_match_hint: '试试其他目的地或旅行名称',
    trips_empty: '还没有记录旅行',
    trips_empty_hint: '点击 + 按钮添加您的第一次旅行',
    trip_edit: '编辑旅行',
    trip_share: '分享旅行',
    trip_delete: '删除旅行',
    trip_leave: '退出旅行',
    trip_confirm_delete: '删除这次旅行？',
    trip_confirm_leave: '退出这次旅行？',

    // Restaurants page
    restaurants_title: '去过的餐厅',
    restaurants_search_placeholder: '搜索餐厅…',
    restaurants_no_match_hint: '试试其他餐厅名称、菜系、城市或国家',
    restaurants_empty: '还没有记录餐厅',
    restaurants_empty_hint: '点击 + 按钮添加您的第一条用餐记录',
    restaurant_confirm_delete: '删除这家餐厅？',
    restaurant_confirm_leave: '退出这家餐厅？',

    // Hotels page
    hotels_title: '去过的酒店',
    hotels_search_placeholder: '搜索酒店…',
    hotels_no_match_hint: '试试其他酒店名称、城市或国家',
    hotels_empty: '还没有记录酒店',
    hotels_empty_hint: '点击 + 按钮添加您的第一次入住',
    hotel_confirm_delete: '删除这家酒店？',
    hotel_confirm_leave: '退出这家酒店？',

    // Common actions
    common_edit: '编辑',
    common_share: '分享',
    common_delete: '删除',
    common_leave: '离开',
    common_cancel: '取消',
    common_save: '保存',
    common_add: '添加',
    common_remove: '移除',

    // Sort
    sort_by: '排序',
    sort_newest: '最新日期',
    sort_oldest: '最早日期',
    sort_highest_rating: '最高评分',
    sort_lowest_rating: '最低评分',

    // FAB
    fab_trip: '旅行',
    fab_restaurant: '餐厅',
    fab_hotel: '酒店',

    // Settings
    settings_title: '设置',
    settings_general: '通用',
    settings_demo_mode: '演示模式',
    settings_appearance: '外观',
    settings_appearance_system: '跟随系统',
    settings_appearance_light: '浅色',
    settings_appearance_dark: '深色',
    settings_language: '语言',
    settings_help: '帮助',
    settings_contact_support: '联系支持',
    settings_about: '关于',
    settings_share_app: "分享 LET'S GO",
    settings_copied: '已复制！',
    settings_privacy: '隐私政策',
    settings_terms: '服务条款',

    // Notifications
    notif_title: '通知',
    notif_empty: '没有待处理的邀请。',
    notif_pending: '待处理邀请',
    notif_invited: '邀请了您',
    notif_accept: '接受',
    notif_decline: '拒绝',

    // Future Plans
    plan_title: '未来计划',
    plan_my_plans: '我的计划',
    plan_empty: '还没有计划，添加您的第一个！',
    plan_add: '添加计划',
    plan_title_ph: '计划标题',
    plan_notes_ph: '备注（可选）',
    plan_title_input: '计划标题...',
    plan_notes_input: '备注（可选）...',
    plan_type_trip: '旅行',
    plan_type_dining: '餐饮',
    plan_type_hotel: '酒店',

    // Collaborator modal
    collab_invite_ph: '通过邮箱邀请…',
    collab_results: '搜索结果',
    collab_already_added: '已添加',
    collab_invite: '邀请',
    collab_not_found: '未找到该邮箱对应的账号。',
    collab_has_access: '有访问权限',
    collab_loading: '加载中…',
    collab_you: '（你）',
    collab_owner: '所有者',
    collab_no_collab: '暂无协作者。',
    collab_awaiting: '等待响应',
    collab_pending: '待确认',
    collab_remove: '移除',

    // What's New
    new_title: '最新动态',
    new_version: '版本',
    new_latest: '最新',

    // Trip detail
    detail_highlights: '精彩集锦',
    detail_restaurants: '餐厅',
    detail_hotels: '酒店',
    detail_upload_photos: '上传旅行照片',
    detail_upload_hint: '点击选择 · 最多 20 张',
    detail_add_photos: '添加照片',
    detail_no_restaurants: '还没有餐厅记录。点击 + 按钮添加用餐。',
    detail_no_hotels: '还没有酒店记录。点击 + 按钮添加入住。',

    // World Map
    world_footprint: '足迹地图',
    world_map_dining: '餐饮',
    world_map_hotel: '住宿',

    // Loading
    loading: '加载中',
    loading_stuck: '加载时间超出预期。',
    loading_reload: '重新加载',

    // Calendar / address search
    calendar_placeholder: '月月/日日/年年',
    address_search_placeholder: '搜索地址或地点名称…',

    // Form shared
    form_required: '（必填）',
    form_cover_photo: '封面照片',
    form_click_upload: '点击上传',
    form_rating: '评分',
    form_total_expense: '总消费',
    form_add_to_trip: '添加至旅行',
    form_select_trip: '选择旅行…',
    form_select: '请选择…',
    form_address: '地址',
    form_save_draft: '保存草稿',
    form_save_changes: '保存修改',
    form_changes_saved: '修改已保存',
    form_draft_saved: '草稿已保存',
    form_date: '日期',

    // Trip modal
    trip_modal_name_ph: '例如：东京，日本（2025年夏）',
    trip_modal_city_ph: '例如：东京',
    trip_modal_country_ph: '例如：日本',
    trip_modal_edit: '编辑旅行',
    trip_modal_add: '添加旅行',
    trip_modal_name: '旅行名称',
    trip_modal_city: '城市',
    trip_modal_country: '国家',
    trip_modal_start_date: '开始日期',
    trip_modal_end_date: '结束日期',
    trip_modal_highlights: '精彩照片',
    trip_modal_add_photos: '点击添加照片（0/20）',
    trip_modal_upload_cover: '点击上传封面',
    trip_modal_created: '旅行已创建',
    trip_modal_create: '创建旅行',

    // Restaurant modal
    rest_modal_name_ph: '例如：久藏烧烤',
    rest_modal_cuisine_ph: '例如：日料',
    rest_modal_edit: '编辑餐厅',
    rest_modal_add: '添加餐厅',
    rest_modal_name: '餐厅名称',
    rest_modal_cuisine: '菜系',
    rest_modal_meal: '餐次',
    rest_modal_michelin: '米其林星级',
    rest_modal_michelin_none: '无',
    rest_modal_created: '餐厅已添加',
    rest_modal_create: '添加餐厅',

    // Meal options (values kept in English; only display is translated)
    meal_breakfast: '早餐',
    meal_brunch: '早午餐',
    meal_lunch: '午餐',
    meal_afternoon_tea: '下午茶',
    meal_dinner: '晚餐',
    meal_late_night: '宵夜',

    // Hotel card
    hotel_nights: '晚',
    hotel_nights_plural: '晚',
    hotel_per_night: '/ 晚',

    // Hotel modal
    hotel_modal_name_ph: '例如：东京安缦',
    hotel_modal_edit: '编辑酒店',
    hotel_modal_add: '添加酒店',
    hotel_modal_name: '酒店名称',
    hotel_modal_checkin: '入住日期',
    hotel_modal_checkout: '退房日期',
    hotel_modal_room_type: '房型',
    hotel_modal_view_type: '景观',
    hotel_modal_created: '酒店已添加',
    hotel_modal_create: '添加酒店',

    // Room & view types (values kept in English; only display is translated)
    room_villa: '别墅',
    room_suite: '套房',
    room_king: '大床房',
    room_queen: '标准大床',
    room_twin: '双床房',
    room_studio: '工作室',
    view_city: '城市景观',
    view_ocean: '海景',
    view_lake: '湖景',
    view_river: '河景',
    view_mountain: '山景',
    view_garden: '花园景观',
    view_park: '公园景观',
    view_no_view: '无景观',

    // Language names
    lang_english: '英文',
    lang_chinese: '中文',

    // Drawers
    common_done: '完成',
    drawer_date_time: '日期与时间',
    drawer_our_dishes: '我们的菜品',
    drawer_dish: '道菜',
    drawer_dishes: '道菜',
    drawer_add_dish: '添加菜品',
    drawer_dish_name_ph: '菜品名称',
    drawer_notes_ph: '备注（可选）',
    drawer_photo: '照片',
    dish_appetizer: '前菜',
    dish_mains: '主菜',
    dish_dessert: '甜点',
    dish_drinks: '饮品',
    dish_snack: '小食',
    hotel_drawer_duration: '入住时长',
    hotel_drawer_notes: '备注',
    hotel_drawer_note_ph: '添加备注…',
    hotel_drawer_no_notes: '暂无备注。',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
