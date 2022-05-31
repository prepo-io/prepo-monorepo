# FE PR Checklist

- [ ] Self-reviewed each line of code, preempted questions about logic or decisions
- [ ] Noted any intentional deviations from design
- [ ] Tried hard to break it and failed, think like a malicious user trying to find edge cases to break the app
- [ ] Tested on supported device sizes
    - [ ] iPhone 12 Pro
    - [ ] iPad Air
    - [ ] 1920x1080 (how to add custom size: [https://umaar.com/dev-tips/51-add-new-device/](https://umaar.com/dev-tips/51-add-new-device/))
- [ ] Tested all widths between 1920px wide to 390px wide and confirmed no weird breakages at widths in between
- [ ] (if related to balances) Tested with empty wallet, modest wallet, whale wallet
- [ ] (if browser specific logic) Tested on Brave, Firefox, Safari
- [ ] (if styling) Tested Light/Dark mode
