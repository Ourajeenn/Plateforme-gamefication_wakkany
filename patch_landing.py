with open('src/pages/LandingPage.jsx', 'r', encoding='utf-8', newline='') as f:
    content = f.read()

old_block = (
    "      {landingTab === 'waitlist' ? (\r\n"
    "        <WaitlistPage onBack={goHome} />\r\n"
    "      ) : landingTab === 'about' ? (\r\n"
    "        <AboutPage onBack={goHome} />\r\n"
    "      ) : landingTab === 'blog' ? (\r\n"
    '        <div className="pt-24"><HistoireView /></div>\r\n'
    "      ) : landingTab === 'archetypes' ? (\r\n"
    "        <ArchetypesPage onBack={goHome} onJoin={handleJoinClick} />\r\n"
    "      ) : (\r\n"
    "        <>\r\n"
    "            {/* Hero Section */}"
)

new_block = (
    "      <Suspense fallback={<PageLoader />}>\r\n"
    "        {landingTab === 'waitlist' ? (\r\n"
    "          <WaitlistPage onBack={goHome} />\r\n"
    "        ) : landingTab === 'about' ? (\r\n"
    "          <AboutPage onBack={goHome} />\r\n"
    "        ) : landingTab === 'blog' ? (\r\n"
    '          <div className="pt-24"><HistoireView /></div>\r\n'
    "        ) : landingTab === 'archetypes' ? (\r\n"
    "          <ArchetypesPage onBack={goHome} onJoin={handleJoinClick} />\r\n"
    "        ) : (\r\n"
    "          <>\r\n"
    "            {/* Hero Section */}"
)

if old_block in content:
    print("Found old block, replacing...")
    content = content.replace(old_block, new_block, 1)
else:
    print("ERROR: old block not found!")
    exit(1)

# Fix closing: the original closing for the big ternary was:
#           </>
#       )}
# After the new_block change, the <> became <> indented by 10 spaces (2 more), so closing is still:
#           </>
#       )}
# We want to change:
#           </>
#       )}
# to:
#           </>
#         )}
#       </Suspense>

old_close = "          </>\r\n      )}"
new_close = "          </>\r\n        )}\r\n      </Suspense>"

if old_close in content:
    print("Found old closing, replacing...")
    content = content.replace(old_close, new_close, 1)
else:
    print("ERROR: old closing not found! Trying alternatives...")
    # The old <> was at 8 spaces (        <>), so its close is also at 8 spaces
    old_close2 = "        </>\r\n      )}"
    if old_close2 in content:
        print("Found alternative closing")
        content = content.replace(old_close2, "        </>\r\n        )}\r\n      </Suspense>", 1)
    else:
        print("Neither found!")
        # Show around end of file
        print(repr(content[-200:]))
        exit(1)

with open('src/pages/LandingPage.jsx', 'w', encoding='utf-8', newline='') as f:
    f.write(content)

print("Done!")
