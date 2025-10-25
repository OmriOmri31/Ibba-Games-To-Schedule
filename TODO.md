# Basketball Referee Scheduler - TODO

## ✅ Completed Features

- [x] Basic web scraping with Selenium
- [x] Multi-page pagination with smart content comparison
- [x] Clean team/league name extraction (2nd + 3rd words)
- [x] Google Calendar OAuth integration (Google Identity Services)
- [x] Create calendar events automatically
- [x] Token persistence in localStorage
- [x] JSON file storage with change detection
- [x] Compare old vs new games (added/removed)
- [x] Update Google Calendar based on changes
- [x] Production deployment with PM2
- [x] Headless Chrome mode
- [x] URL redirect handling (#!/games vs #!/personal)
- [x] Full end-to-end testing

## 🔮 Future Enhancements

### High Priority
- [ ] Delete calendar events when games are removed (requires storing event IDs)
- [ ] Handle token refresh automatically (tokens expire after 1 hour)
- [ ] Add loading spinner during scraping
- [ ] Better error messages in Hebrew

### Medium Priority
- [ ] Export games to Excel/CSV
- [ ] Email notifications for new games
- [ ] Dark mode toggle
- [ ] Filter games by league
- [ ] Mobile app version (React Native?)

### Low Priority
- [ ] Multi-user support
- [ ] Share calendar with colleagues
- [ ] Statistics dashboard (games per month, etc.)
- [ ] Custom game notes/reminders

## 🐛 Known Issues

- Google token expires after 1 hour (need auto-refresh)
- Calendar event deletion not implemented (requires storing Google event IDs in JSON)
- Website sometimes redirects to #!/personal (workaround implemented)

## 💡 Ideas

- Add push notifications for game changes
- Integrate with other calendar services (Outlook, Apple Calendar)
- Add map view for game locations
- Create desktop app with Electron
- Add backup/restore functionality

---

**Last Updated:** October 2025
