-- Add receipt header and footer settings
INSERT INTO system_settings (key, value, description)
VALUES 
  ('receipt_header', 'COPY GENERAL s.r.o.
Senovazne nam. 26, 110 00 Praha 1
www.copygeneral.cz
IC: 45280436, DIC: CZ45280436', 'Hlavička účtenky - zobrazuje se nahoře na účtence'),
  ('receipt_footer', 'Zjednoduseny danovy doklad
Dekujeme za nakup!', 'Patička účtenky - zobrazuje se dole na účtence')
ON CONFLICT (key) DO NOTHING;