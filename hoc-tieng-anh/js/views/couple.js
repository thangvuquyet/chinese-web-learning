App.register('couple', {
  render(root) {
    const { h } = U;
    const ic = n => Icon.svg(n);
    const me = Store.P();
    const oid = Store.otherId(me.id);
    const A = Store.view('meo'), B = Store.view('cho');
    const a = A, b = B;
    const week = U.weekDays();
    const wx = v => week.map(k => (v.days && v.days[k]) || 0);
    const aw = U.sum(wx(a)), bw = U.sum(wx(b));
    let teamStreak = 0;
    for (let i = 0; i < 400; i++) {
      const k = U.addDays(U.dayKey(), -i);
      const both = (a.days && a.days[k]) > 0 && (b.days && b.days[k]) > 0;
      if (both) teamStreak++;
      else if (i > 0) break;
    }
    const teamGoal = ((Store.get('meo').goal || 60) + (Store.get('cho').goal || 60)) * 5;
    const tg = Math.min(1, (aw + bw) / teamGoal);
    root.appendChild(h('div.hero',
      h('div.row.wrap.between',
        h('div', { style: { maxWidth: '520px' } },
          h('div.eyebrow', { style: { color: '#AEB7DD' } }, 'Đội ' + a.name + ' & ' + b.name),
          h('h2', { style: { fontSize: '28px', fontWeight: 850, letterSpacing: '-.03em', marginTop: '6px' } }, teamStreak ? teamStreak + ' ngày cùng học liên tiếp' : 'Cùng học hôm nay để mở chuỗi đôi'),
          h('p.muted.mt8', 'Chuỗi đôi chỉ tăng khi cả hai cùng học trong ngày. Mục tiêu tuần của đội: ' + teamGoal + ' XP.'),
          h('div.mt', h('div.row.between', { style: { fontSize: '13px', color: '#AEB7DD', marginBottom: '6px' } }, h('span', 'Mục tiêu tuần'), h('b', { style: { color: '#fff' } }, (aw + bw) + ' / ' + teamGoal + ' XP')), UI.bar(tg, 'dark gold'))),
        Art.duo({ size: 'sm' }))));

    const lead = aw === bw ? 'Hai người đang hòa' : (aw > bw ? a.name : b.name) + ' đang dẫn ' + Math.abs(aw - bw) + ' XP';
    const duel = h('div.card',
      h('div.card-h', h('h3', 'Đua XP tuần này'), h('span.r.small.muted', lead)),
      h('div.duel', h('div.side', Art.avatar('meo', 'lg', { ring: true }), h('div.nm', a.name), h('div.val', aw)), h('div.vs', 'VS'), h('div.side', Art.avatar('cho', 'lg', { ring: true }), h('div.nm', b.name), h('div.val', bw))),
      h('div.vsbar', h('i.meo', { style: { width: (aw + bw ? aw / (aw + bw) * 100 : 50) + '%' } }), h('i.cho', { style: { width: (aw + bw ? bw / (aw + bw) * 100 : 50) + '%' } })),
      h('div.mt', Charts.bars2({ labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'], a: { vals: wx(a), color: 'var(--meo)', name: a.name }, b: { vals: wx(b), color: 'var(--cho)', name: b.name }, h: 150 })));

    const lastT = v => (v.tests || []).filter(t => t.T != null).slice(-1)[0];
    const rows = [
      ['Điểm dự đoán', v => v.pred && v.pred.T ? v.pred.T : null],
      ['Listening', v => v.pred ? v.pred.L : null, 495],
      ['Reading', v => v.pred ? v.pred.R : null, 495],
      ['Đề gần nhất', v => lastT(v) ? lastT(v).T : null, 990],
      ['Từ đã học', v => v.words || 0],
      ['Nhớ chắc', v => v.known || 0],
      ['Chuỗi ngày', v => v.streak ? v.streak.n : 0],
      ['Phát âm TB', v => v.speak || null, 100],
      ['Tổng XP', v => v.xp || 0]
    ];
    const cmp = h('div.card', h('div.card-h', h('h3', 'So tiến độ'), h('span.r.small.muted', [a, b].some(v => v.src === 'snap') ? 'Có dữ liệu từ mã tiến độ' : 'Cùng máy này')),
      h('div.cmp-row', { style: { paddingTop: 0 } }, h('div.a', h('b', a.name), Art.avatar('meo', 'sm')), h('div.lbl'), h('div.b', Art.avatar('cho', 'sm'), h('b', b.name))),
      rows.map(([k, f, mx]) => {
        const va = f(a), vb = f(b);
        const m = mx || Math.max(va || 0, vb || 0, 1);
        return h('div.cmp-row',
          h('div.a', h('span.v' + (va > vb ? '.lead' : ''), va != null ? va.toLocaleString('vi-VN') : '—'), UI.bar((va || 0) / m, 'meo')),
          h('div.lbl', k),
          h('div.b', UI.bar((vb || 0) / m, 'cho'), h('span.v' + (vb > va ? '.lead' : ''), vb != null ? vb.toLocaleString('vi-VN') : '—')));
      }));

    const inbox = Store.inbox(me.id);
    const sent = Store.db.notes.filter(n => n.from === me.id).sort((x, y) => y.at - x.at);
    const QUICK = ['Tối nay học 20 phút cùng nhau nhé?', 'Mình vừa làm xong một đề, tới lượt bạn đó', 'Nhớ ôn từ đến hạn hôm nay nhé', 'Cố lên, sắp chạm mục tiêu rồi', 'Cuối tuần làm đề rút gọn cùng nhau không?', 'Hôm nay mình học xong rồi, giữ chuỗi đôi nha'];
    const ta = h('textarea.textarea', { rows: 2, maxlength: 200, placeholder: 'Viết lời nhắn cho ' + Store.get(oid).name + '…' });
    const sendNote = text => { if (!text.trim()) return; Store.addNote(text.trim()); FX.sfx.pop(); FX.toast(Store.db.me === oid || Store.view(oid).src === 'local' ? 'Đã gửi, ' + Store.get(oid).name + ' sẽ thấy khi mở app' : 'Đã lưu. Gửi kèm trong mã tiến độ ở dưới'); App.refresh(); };
    const notes = h('div.card',
      h('div.card-h', h('h3', 'Lời nhắn'), h('span.r.small.muted', 'Động viên nhau mỗi ngày')),
      h('div.row.wrap', { style: { gap: '6px' } }, QUICK.map(q => h('button.chip-btn', { onclick: () => sendNote(q) }, q))),
      h('div.row.mt', ta, h('button.btn', { onclick: () => sendNote(ta.value) }, ic('send'))),
      inbox.length ? h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Nhận được'), inbox.slice(0, 5).map(n => h('div.note' + (n.read ? '' : '.unread'), Art.avatar(n.from, 'xs'), h('div.grow', h('div', n.text), h('div.meta', U.ago(n.at)))))) : null,
      sent.length ? h('div.mt', h('div.eyebrow', { style: { marginBottom: '8px' } }, 'Đã gửi'), sent.slice(0, 3).map(n => h('div.note', Art.avatar(n.from, 'xs'), h('div.grow', h('div', n.text), h('div.meta', U.ago(n.at) + (n.sent ? ' · đã gửi qua mã' : '')))))) : null);
    inbox.forEach(n => n.read = true); Store.save();

    const codeOut = h('div');
    const pasteInp = h('input.input', { placeholder: 'Dán link hoặc mã tiến độ của ' + Store.get(oid).name });
    const sync = h('div.card',
      h('div.card-h', h('span.tile-ic.sm', ic('link')), h('div', h('h3', 'Học trên hai máy khác nhau?'), h('div.small.muted', 'Tiến độ lưu riêng trong trình duyệt mỗi máy. Gửi mã cho nhau để cập nhật.'))),
      h('div.grid.g2',
        h('div.col', h('b', '1. Gửi tiến độ của ' + me.name), h('p.small.muted', 'Tạo link rồi gửi qua Zalo hoặc Messenger. ' + Store.get(oid).name + ' mở link là thấy tiến độ của bạn (kèm lời nhắn chưa gửi).'),
          h('button.btn', { onclick: async () => {
            const code = await Store.shareCode(me.id);
            const url = location.origin + location.pathname + '#/sync/' + code;
            U.clear(codeOut);
            codeOut.append(h('textarea.textarea', { rows: 3, readonly: true, onclick: e => e.target.select() }, url),
              h('div.row.mt8', h('button.btn.secondary.sm', { onclick: async () => { try { await navigator.clipboard.writeText(url); FX.toast('Đã chép link'); } catch (e) { FX.toast('Hãy chọn và chép thủ công'); } } }, ic('copy'), 'Chép link'),
                navigator.share ? h('button.btn.secondary.sm', { onclick: () => navigator.share({ title: 'Tiến độ TOEIC của ' + me.name, url }).catch(() => {}) }, ic('share'), 'Chia sẻ') : null));
          } }, ic('share'), 'Tạo link tiến độ'), codeOut),
        h('div.col', h('b', '2. Nhận tiến độ của ' + Store.get(oid).name), h('p.small.muted', Store.db.snaps[oid] ? 'Cập nhật lần cuối ' + U.ago(Store.db.snaps[oid].at) + '.' : 'Chưa nhận mã nào.'), pasteInp,
          h('button.btn.secondary', { onclick: async () => {
            const v = pasteInp.value.trim();
            const code = v.includes('#/sync/') ? v.split('#/sync/')[1] : v;
            try { const r = await Store.importCode(code); FX.toast(r.stale ? 'Mã này cũ hơn dữ liệu đang có' : 'Đã cập nhật tiến độ của ' + r.name); App.refresh(); } catch (e) { FX.toast('Mã không hợp lệ'); }
          } }, ic('download'), 'Cập nhật'))));

    root.append(h('div.layout.mt', h('div.col.g16', duel, cmp), h('div.aside', notes, sync)));
  }
});
