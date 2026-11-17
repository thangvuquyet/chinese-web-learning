const Icon = (() => {
  const P = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9"/>',
    route: '<circle cx="6" cy="18.5" r="2.5"/><circle cx="18" cy="5.5" r="2.5"/><path d="M8.5 18.5H16a3.5 3.5 0 0 0 0-7H8a3.5 3.5 0 0 1 0-7h7.5"/>',
    cards: '<rect x="3.5" y="7" width="12.5" height="14" rx="2"/><path d="M7.5 3.5H18a2.5 2.5 0 0 1 2.5 2.5v11"/>',
    exam: '<rect x="5" y="4" width="14" height="17.5" rx="2"/><path d="M9 4V2.8h6V4"/><path d="m9 12.5 2 2 4-4"/><path d="M9 17.5h6"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    flame: '<path d="M12 21.5c3.9 0 7-2.6 7-6.6 0-3-1.8-5.3-3.4-7.1-.3 1.7-1.1 2.9-2.3 3.5.4-3.4-1.3-6.4-3.8-8.3.1 3.3-1.9 5.3-3.1 7-.8 1.1-1.4 2.7-1.4 4.6 0 4.2 3.1 6.9 7 6.9Z"/>',
    star: '<path d="m12 3.2 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17l-5.38 2.85 1.03-6L3.3 9.6l6-.9z"/>',
    volume: '<path d="M11 5 6.5 9H3.5v6h3L11 19z"/><path d="M15.5 9a4.5 4.5 0 0 1 0 6"/><path d="M18.5 6a8.5 8.5 0 0 1 0 12"/>',
    mute: '<path d="M11 5 6.5 9H3.5v6h3L11 19z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
    mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><path d="M12 17.5v4"/>',
    headphones: '<path d="M3.5 18v-5.5a8.5 8.5 0 0 1 17 0V18"/><rect x="3.5" y="14" width="4.5" height="7" rx="1.5"/><rect x="16" y="14" width="4.5" height="7" rx="1.5"/>',
    library: '<path d="M4 19.5V5a2 2 0 0 1 2-2h2v18H6a2 2 0 0 1-2-1.5Z"/><path d="M8 3h4v18H8"/><path d="m14 4.2 3.8-1 3.7 15.6-3.8.9z"/>',
    book: '<path d="M12 6.5C10.5 5 8 4.5 3.5 4.5v14c4.5 0 7 .5 8.5 2 1.5-1.5 4-2 8.5-2v-14c-4.5 0-7 .5-8.5 2Z"/><path d="M12 6.5v14"/>',
    blocks: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M17 13.5v7M13.5 17h7"/>',
    wave: '<path d="M2.5 12h2l2.2-6 3.1 12 3-9 2.1 6 1.7-3h4.9"/>',
    brush: '<path d="M18.2 2.8a2.1 2.1 0 0 1 3 3L10.4 16.6l-3.6.6.6-3.6z"/><path d="M6.8 17.2c-1.7 0-3.3 1-3.3 2.6 0 .9-.5 1.4-1.5 1.4 4.1 0 6.4-1.4 6.4-3.3"/>',
    chart: '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3" height="6.5" rx="1"/><rect x="10.5" y="5.5" width="3" height="12" rx="1"/><rect x="16" y="13" width="3" height="4.5" rx="1"/>',
    trend: '<path d="M3.5 17.5 9 12l4 4 7.5-8.5"/><path d="M15 7.5h5.5V13"/>',
    bulb: '<path d="M9 18h6M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-4 11.6c.6.5 1 1.2 1 2V17h6v-.9c0-.8.4-1.5 1-2A6.5 6.5 0 0 0 12 2.5Z"/>',
    sliders: '<path d="M4 6.5h9.5M18.5 6.5H20M4 12h3.5M12.5 12H20M4 17.5h11.5M20.5 17.5H20"/><circle cx="16" cy="6.5" r="2.3"/><circle cx="10" cy="12" r="2.3"/><circle cx="18" cy="17.5" r="2.3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
    heart: '<path d="M12 20.3s-8-4.6-8-10.3A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 20 10c0 5.7-8 10.3-8 10.3Z"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.8"/><path d="M16.3 14.3a5.5 5.5 0 0 1 5.2 6.2"/>',
    mail: '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.5 7 8.5 6 8.5-6"/>',
    trophy: '<path d="M8 21h8M12 16.5V21M7 3.5h10v5.5a5 5 0 0 1-10 0z"/><path d="M7 5.5H4v1.5A3.5 3.5 0 0 0 7.5 10.5M17 5.5h3v1.5a3.5 3.5 0 0 1-3.5 3.5"/>',
    hourglass: '<path d="M6 2.5h12M6 21.5h12M7 2.5v3a5 5 0 0 0 10 0v-3M7 21.5v-3a5 5 0 0 1 10 0v3"/>',
    timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.5 2M9.5 2.5h5"/>',
    pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1"/><rect x="14" y="5" width="3.5" height="14" rx="1"/>',
    play: '<path d="M8 5.5v13l10-6.5z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
    edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8"/><path d="M4 3.5V8h4.5"/><path d="M4 13a8 8 0 0 0 14.3 4.9L20 16"/><path d="M20 20.5V16h-4.5"/>',
    repeat: '<path d="m17 2.5 3.5 3.5L17 9.5"/><path d="M3.5 11V9.5a3.5 3.5 0 0 1 3.5-3.5h13.5"/><path d="m7 21.5-3.5-3.5L7 14.5"/><path d="M20.5 13v1.5a3.5 3.5 0 0 1-3.5 3.5H3.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="16" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    sparkle: '<path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z"/><path d="M19 15.5c.3 1.8 1 2.5 2.5 2.8-1.5.3-2.2 1-2.5 2.7-.3-1.7-1-2.4-2.5-2.7 1.5-.3 2.2-1 2.5-2.8Z"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 7.7-1.5"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
    download: '<path d="M12 3.5v11.5M7 10l5 5 5-5M4 20.5h16"/>',
    upload: '<path d="M12 15V3.5M7 8.5l5-5 5 5M4 20.5h16"/>',
    trash: '<path d="M4 7h16M9.5 7V4h5v3M6 7l1 13.5h10L18 7"/><path d="M10 11v6M14 11v6"/>',
    snow: '<path d="M12 2.5v19M3.8 7.2l16.4 9.6M20.2 7.2 3.8 16.8"/><path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2"/>',
    medal: '<circle cx="12" cy="15" r="5.5"/><path d="M8.5 10.5 6 3h4l2 4.5L14 3h4l-2.5 7.5"/><path d="m12 12.8.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.8-1.6.8.3-1.7-1.2-1.2 1.7-.2z"/>',
    rocket: '<path d="M12 15.5 8.5 12c1-4.5 4.5-8.5 11-9.5-1 6.5-5 10-9.5 11"/><path d="M8.5 12h-4l2.5-3.5h4M12 15.5v4l3.5-2.5v-4"/><path d="M6.5 17.5c-1 1-1.5 3-1.5 3s2-.5 3-1.5"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.5"/>',
    x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    type: '<path d="M4.5 7V5h15v2M12 5v14M9 19h6"/>',
    scroll: '<path d="M7 3.5h11a2.5 2.5 0 0 1 0 5h-1.5"/><path d="M16.5 8.5v10a2 2 0 0 1-2 2H6a2.5 2.5 0 0 1 0-5h1.5"/><path d="M7 3.5a2.5 2.5 0 0 0-2.5 2.5v9.5M10 9h4M10 12.5h4"/>',
    brain: '<path d="M9.5 4a3 3 0 0 0-3 3 3 3 0 0 0-2.5 4.5A3.2 3.2 0 0 0 6 17a3 3 0 0 0 3.5 3V4Z"/><path d="M14.5 4a3 3 0 0 1 3 3 3 3 0 0 1 2.5 4.5A3.2 3.2 0 0 1 18 17a3 3 0 0 1-3.5 3V4Z"/>',
    bolt: '<path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z"/>',
    message: '<path d="M4 5.5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-9l-5 4v-4H4a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z"/><path d="M7.5 10h9M7.5 13.5h6"/>',
    alert: '<path d="M12 3.5 2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>',
    dice: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.1"/><circle cx="15.5" cy="15.5" r="1.1"/><circle cx="12" cy="12" r="1.1"/><circle cx="15.5" cy="8.5" r="1.1"/><circle cx="8.5" cy="15.5" r="1.1"/>',
    ear: '<path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 3-2.5 4-3 6.5-.4 2.2-1.8 4-4 4A3.5 3.5 0 0 1 7 16"/><path d="M9.5 9.5a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3.5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    pin: '<path d="M9 3.5h6l-1 5 3.5 3.5v1.5h-11V12L10 8.5z"/><path d="M12 13.5v7"/>',
    crown: '<path d="m3.5 8 4 3.5L12 5l4.5 6.5 4-3.5-1.5 10.5H5z"/><path d="M5.5 21h13"/>',
    bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>',
    save: '<path d="M5 3.5h11l3.5 3.5v12.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"/><path d="M8 3.5V9h7V3.5M7.5 20.5v-6h9v6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.6v.3"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-8.5 8.5"/>',
    folder: '<path d="M3.5 6.5a1 1 0 0 1 1-1h5l2 2.5h8a1 1 0 0 1 1 1v9.5a1 1 0 0 1-1 1h-15a1 1 0 0 1-1-1z"/>',
    cap: '<path d="m2.5 9 9.5-4.5L21.5 9 12 13.5z"/><path d="M6.5 11v5c1.5 1.5 3.5 2.2 5.5 2.2s4-.7 5.5-2.2v-5M21.5 9v5.5"/>',
    shuffle: '<path d="M3.5 7h3.5c4.5 0 5.5 10 10 10h3.5M17.5 14l3 3-3 3"/><path d="M3.5 17H7c1.7 0 2.8-1.4 3.7-3.2M13.3 10.2C14.2 8.4 15.3 7 17 7h3.5M17.5 4l3 3-3 3"/>',
    arrowDown: '<path d="M12 4.5v15M6 13.5l6 6 6-6"/>',
    arrowUp: '<path d="M12 19.5v-15M6 10.5l6-6 6 6"/>',
    chevron: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    back: '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    panelClose: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9 4v16"/><path d="m15.5 9.5-2.5 2.5 2.5 2.5"/>',
    panelOpen: '<rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M9 4v16"/><path d="m13 9.5 2.5 2.5-2.5 2.5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2"/><path d="M3 12.5h18"/>',
    paw: '<ellipse cx="12" cy="16" rx="4.6" ry="3.8"/><circle cx="6" cy="10.5" r="1.9"/><circle cx="9.5" cy="6.5" r="1.9"/><circle cx="14.5" cy="6.5" r="1.9"/><circle cx="18" cy="10.5" r="1.9"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"/>',
    layers: '<path d="m12 3.5 9 4.5-9 4.5L3 8z"/><path d="m3 12.5 9 4.5 9-4.5"/><path d="m3 16.5 9 4.5 9-4.5"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.8" cy="6.5" r="1"/><circle cx="4.8" cy="12" r="1"/><circle cx="4.8" cy="17.5" r="1"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    flag: '<path d="M5 21V4"/><path d="M5 4.5c4-2 7 2 11 0l2.5-1v9l-2.5 1c-4 2-7-2-11 0"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.2l3.3 2"/>',
    file: '<path d="M14 3.5H7a1.5 1.5 0 0 0-1.5 1.5v14A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5V8z"/><path d="M14 3.5V8h4.5M9 12.5h6M9 16h6"/>',
    chat: '<path d="M4 5h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H9l-4 3.5V15H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"/><path d="M18 9h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-1v2.5L16 19h-4"/>',
    share: '<circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="m8.2 10.8 7.6-4.1M8.2 13.2l7.6 4.1"/>',
    link: '<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>',
    copy: '<rect x="8.5" y="8.5" width="12" height="12" rx="2"/><path d="M15.5 8.5V5.5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3"/>',
    send: '<path d="m21 3-9.5 9.5M21 3l-6.5 18-3-8.5L3 9.5z"/>',
    award: '<circle cx="12" cy="9" r="5.5"/><path d="m8.5 13.5-1.5 7.5 5-2.5 5 2.5-1.5-7.5"/>',
    zap: '<path d="M13 2.5 4.5 14H11l-1 7.5L18.5 10H12z"/>',
    activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    pen: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
    plane: '<path d="M10.5 13.5 3 11l1.5-1.5 7.5.5 4.5-4.5a2 2 0 0 1 3 3L15 13l.5 7.5L14 22l-2.5-7.5-3 3V20l-1.5 1-1-3.5L2.5 16l1-1.5h2.5z"/>',
    building: '<rect x="4.5" y="3" width="15" height="18" rx="1.5"/><path d="M9 7h1.5M13.5 7H15M9 11h1.5M13.5 11H15M9 15h1.5M13.5 15H15M10 21v-3h4v3"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="17.5" cy="20" r="1.4"/><path d="M2.5 3.5h2.5l2.6 11.5h10.6L20.5 7H6"/>',
    truck: '<path d="M2.5 6h11v10h-11z"/><path d="M13.5 9.5h4l3 3.5V16h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    factory: '<path d="M3 20.5V10l5 3V10l5 3V10l5 3V4h3v16.5z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/>',
    bed: '<path d="M3 19.5V6M3 15h18v4.5M21 15v-3a3 3 0 0 0-3-3h-7v6"/><circle cx="7" cy="11.5" r="2"/>',
    ticket: '<path d="M3.5 8a2 2 0 0 0 0 4v0a2 2 0 0 1 0 4V19h17v-3a2 2 0 0 1 0-4 2 2 0 0 0 0-4V5h-17z"/><path d="M14 5v14" stroke-dasharray="2 2.5"/>',
    health: '<path d="M9 3.5h6v5.5h5.5v6H15v5.5H9V15H3.5V9H9z"/>',
    bank: '<path d="m3 9 9-5.5L21 9"/><path d="M4.5 9.5h15M6 10v7M10 10v7M14 10v7M18 10v7M3.5 20.5h17M4.5 17.5h15"/>',
    coin: '<circle cx="12" cy="12" r="9"/><path d="M14.8 9a3 3 0 0 0-2.8-1.5c-1.7 0-3 .9-3 2.2 0 3.2 6 1.8 6 4.8 0 1.4-1.3 2.3-3 2.3a3.2 3.2 0 0 1-3-1.7M12 6v1.5M12 16.8v1.5"/>',
    handshake: '<path d="m11 17 2 2a1.4 1.4 0 0 0 2-2"/><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2l-3.5-3.5"/><path d="m21 7-3.5 3.5-3-3a2.5 2.5 0 0 0-3.5 0L9.5 9a1.4 1.4 0 0 0 2 2l2-2"/><path d="M3 7l3.5 3.5L4 13"/><path d="m6.5 10.5 4.5 4.5a1.4 1.4 0 0 1-2 2l-1-1"/>',
    megaphone: '<path d="M3.5 10v4h3l8 5V5l-8 5z"/><path d="M6.5 14l1.5 6h2.5L9.5 14M18 9.5a3.5 3.5 0 0 1 0 5"/>',
    leaf: '<path d="M5 19c0-8 5-13.5 15-14 0 9.5-5.5 14.5-13 14.5"/><path d="M5 19c3-4 6-6.5 10-8.5"/>',
    newspaper: '<path d="M4 5.5h13v13a2 2 0 0 0 2 2H5.5A1.5 1.5 0 0 1 4 19z"/><path d="M17 9h3v9.5a2 2 0 0 1-4 0"/><path d="M7 9h7M7 12.5h7M7 16h4"/>',
    tools: '<path d="M14.5 6.5a4 4 0 0 0 5 5l-8.5 8.5a2 2 0 0 1-3-3l8.5-8.5"/><path d="m14.5 6.5 3-3 3 3-3 3"/>',
    home2: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v11h13V9"/><path d="M10 20v-5.5h4V20"/>',
    bus: '<rect x="4" y="3.5" width="16" height="14" rx="2.5"/><path d="M4 11h16M7.5 17.5V20M16.5 17.5V20"/><circle cx="8" cy="14.3" r=".9"/><circle cx="16" cy="14.3" r=".9"/>',
    utensils: '<path d="M6 3v7a2 2 0 0 0 2 2v9M10 3v7a2 2 0 0 1-2 2M8 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7.5h3"/>',
    ai: '<path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5Z"/><path d="M19 15.5c.3 1.8 1 2.5 2.5 2.8-1.5.3-2.2 1-2.5 2.7-.3-1.7-1-2.4-2.5-2.7 1.5-.3 2.2-1 2.5-2.8Z"/>',
    logout: '<path d="M14 4.5h4a1.5 1.5 0 0 1 1.5 1.5v12a1.5 1.5 0 0 1-1.5 1.5h-4"/><path d="M10 16.5 5.5 12 10 7.5M5.5 12h10"/>',
    swap: '<path d="M7 4 3.5 7.5 7 11"/><path d="M3.5 7.5h14"/><path d="m17 13 3.5 3.5L17 20"/><path d="M20.5 16.5h-14"/>',
    speed: '<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 13.5 4-5"/><circle cx="12" cy="14" r="1.4"/>',
    skip: '<path d="M6 5.5v13l9-6.5z"/><path d="M18 5.5v13"/>',
    rewind: '<path d="M11 6.5v11L4 12z"/><path d="M20 6.5v11L13 12z"/>',
    text: '<path d="M4 6.5h16M4 11h16M4 15.5h10M4 20h7"/>',
    puzzle: '<path d="M9.5 3.5h-5v5.5a2 2 0 1 1 0 4v6.5h5.5a2 2 0 1 1 4 0h5.5V14a2 2 0 1 0 0-4V3.5H14a2 2 0 1 0-4.5 0"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    graph: '<path d="M3.5 3.5v17h17"/><path d="m7 15 4-4 3 3 6-7"/>',
    noteq: '<path d="M5 9h14M5 15h14M15.5 4.5l-7 15"/>',
    seal: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><path d="M8.5 9h7M12 9v7M8.5 16h7"/>'
  };
  const EMO = {
    '🏠': 'home', '🗺️': 'route', '🗺': 'route', '🃏': 'cards', '📝': 'exam', '🌟': 'compass', '🧭': 'compass',
    '🔥': 'flame', '⭐': 'star', '🔊': 'volume', '🔇': 'mute', '🎤': 'mic', '🎙️': 'mic', '🎧': 'headphones',
    '📚': 'library', '📖': 'book', '📗': 'book', '📘': 'book', '🧩': 'blocks', '🧱': 'blocks', '🎵': 'wave',
    '🀄': 'brush', '✍️': 'brush', '📊': 'chart', '📈': 'trend', '💡': 'bulb', '⚙️': 'sliders', '🎛️': 'sliders',
    '🎯': 'target', '💑': 'users', '👫': 'users', '💌': 'mail', '🏆': 'trophy', '⏳': 'hourglass', '⏱️': 'timer',
    '⏰': 'timer', '⏸️': 'pause', '▶️': 'play', '⏹️': 'stop', '✏️': 'edit', '🔄': 'refresh', '♻️': 'refresh',
    '🔁': 'repeat', '📅': 'calendar', '✨': 'sparkle', '🔒': 'lock', '🔓': 'unlock', '🔍': 'search',
    '📥': 'download', '⬇️': 'download', '📤': 'upload', '⬆️': 'upload', '🗑️': 'trash', '🧹': 'trash',
    '❄️': 'snow', '🏅': 'medal', '🚀': 'rocket', '👀': 'eye', '✅': 'checkCircle', '❌': 'x', '🔤': 'type',
    '📜': 'scroll', '🧠': 'brain', '⚡': 'bolt', '💬': 'message', '🗣️': 'message', '⚠️': 'alert', '🎲': 'dice',
    '🔀': 'shuffle', '👂': 'ear', '➕': 'plus', '📌': 'pin', '👑': 'crown', '🔔': 'bell', '💾': 'save',
    'ℹ️': 'info', '🖼️': 'image', '🗂️': 'folder', '🎓': 'cap', '🧾': 'exam', '📋': 'exam'
  };
  function svg(name, cls = '') {
    const s = document.createElement('span');
    s.className = 'ico' + (cls ? ' ' + cls : '');
    s.setAttribute('aria-hidden', 'true');
    s.dataset.i = name;
    s.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${P[name] || P.sparkle}</svg>`;
    return s;
  }
  const KEYS = Object.keys(EMO).sort((a, b) => b.length - a.length);
  function lead(text) {
    const t = text.replace(/^\s+/, '');
    for (const k of KEYS) {
      const bare = k.replace(/️/g, '');
      if (t.startsWith(k)) return [k, t.slice(k.length)];
      if (t.startsWith(bare) && !t.startsWith(bare + '‍')) return [k, t.slice(bare.length).replace(/^️/, '')];
    }
    return null;
  }
  const SOLO = '.chip .em, h1.page > span:first-child, .action .ai, .tile .te, .audio-btn, .mic-btn, .tab .ti, .ico-only';
  const LEAD = '.btn, .sec-title, .chip, .tabs button, .pill, .card > b, .card .row > b, .card h2, .card h3, .modal h2, .stage-actions .btn, label, .opt.plain, .meta > span';
  function apply(el, solo) {
    if (el.dataset.ic) return;
    el.dataset.ic = '1';
    const first = [...el.childNodes].find(n => n.nodeType === 3 ? n.textContent.trim() : true);
    if (!first || first.nodeType !== 3) return;
    const hit = lead(first.textContent);
    if (!hit) return;
    const rest = hit[1].replace(/^\s+/, '');
    if (solo && rest) return;
    const ic = svg(EMO[hit[0]]);
    el.insertBefore(ic, first);
    if (rest) first.textContent = rest; else first.remove();
    if (!rest && el.childNodes.length === 1) el.classList.add('has-solo');
    else el.classList.add('has-ico');
  }
  function run(root) {
    if (!root || root.nodeType !== 1) return;
    const solo = root.matches && root.matches(SOLO) ? [root] : [];
    const lead2 = root.matches && root.matches(LEAD) ? [root] : [];
    solo.concat([...root.querySelectorAll(SOLO)]).forEach(e => apply(e, true));
    lead2.concat([...root.querySelectorAll(LEAD)]).forEach(e => apply(e, false));
  }
  function observe() {
    const targets = ['topbar', 'view', 'tabbar', 'modal-root'].map(id => document.getElementById(id)).filter(Boolean);
    const mo = new MutationObserver(list => {
      for (const m of list) {
        if (m.type === 'childList') m.addedNodes.forEach(n => { if (n.nodeType === 1) run(n); else if (n.nodeType === 3 && n.parentElement) { delete n.parentElement.dataset.ic; run(n.parentElement); } });
      }
    });
    targets.forEach(t => { run(t); mo.observe(t, { childList: true, subtree: true }); });
  }
  return { svg, observe, run, P, EMO };
})();
