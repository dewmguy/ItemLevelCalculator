# Item Identifier Contract

This document freezes the identifier boundary between the calculator and
AzerothCore 3.3.5a. The numeric values below are external data identifiers, not
calculator-defined ordinals. Changing one is a data-compatibility change.

The executable copy of the calculator-supported subset lives in
[`item-identifiers.js`](item-identifiers.js). Display labels, calculation
profiles, and regression names must not be used as identity.

## Authoritative sources

- [AzerothCore `InventoryType`, `ItemClass`, and subclass enums](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Item/ItemTemplate.h#L254-L401)
- [AzerothCore `ItemTemplate` fields](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Item/ItemTemplate.h#L619-L636)
- [AzerothCore item-quality enum](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/shared/SharedDefines.h#L315-L325)
- [AzerothCore item-template documentation](https://www.azerothcore.org/wiki/item_template)
- [AzerothCore base item-template data](https://github.com/azerothcore/azerothcore-wotlk/blob/master/data/sql/base/db_world/item_template.sql)
- [AzerothCore equipment-slot enum](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Player/Player.h#L659-L681)
- [AzerothCore feral attack-power calculation](https://github.com/azerothcore/azerothcore-wotlk/blob/master/src/server/game/Entities/Item/ItemTemplate.h#L742-L754)

## Identity fields

An item identity is the tuple:

```text
(itemClassId, inventoryTypeId, subclassId, qualityId)
```

For weapons, a calculator-only `weaponProfile` may also select a regression:

```text
melee | caster | druid
```

`weaponProfile` is not an AzerothCore `item_template` field and must never
change the class, subclass, or inventory-type IDs. A melee, caster, or feral
staff is always class 2, subclass 10, inventory type 17.

## ItemClass

| Constant | ID | Calculator support |
|---|---:|---|
| `ITEM_CLASS_WEAPON` | 2 | Supported |
| `ITEM_CLASS_ARMOR` | 4 | Supported |

All other AzerothCore item classes are outside this calculator's model.
Unknown classes must be rejected, not routed to the weapon path.

## ItemQuality

| Constant | ID | Calculator support |
|---|---:|---|
| `ITEM_QUALITY_POOR` | 0 | Unsupported |
| `ITEM_QUALITY_NORMAL` | 1 | Unsupported |
| `ITEM_QUALITY_UNCOMMON` | 2 | Supported |
| `ITEM_QUALITY_RARE` | 3 | Supported |
| `ITEM_QUALITY_EPIC` | 4 | Supported |
| `ITEM_QUALITY_LEGENDARY` | 5 | Enum-known, unsupported |
| `ITEM_QUALITY_ARTIFACT` | 6 | Enum-known, unsupported |
| `ITEM_QUALITY_HEIRLOOM` | 7 | Unsupported |

Enum validity and calculator support are separate facts. A known quality must
not be enabled until every required model supplies coefficients for it.

## InventoryType

These are `item_template.InventoryType` values. They are not player
`EquipmentSlots`.

| ID | AzerothCore constant | Calculator label/domain |
|---:|---|---|
| 0 | `INVTYPE_NON_EQUIP` | Unsupported |
| 1 | `INVTYPE_HEAD` | Armor: Head |
| 2 | `INVTYPE_NECK` | Armor: Neck |
| 3 | `INVTYPE_SHOULDERS` | Armor: Shoulders |
| 4 | `INVTYPE_BODY` | Armor: Shirt |
| 5 | `INVTYPE_CHEST` | Armor: Chest |
| 6 | `INVTYPE_WAIST` | Armor: Waist |
| 7 | `INVTYPE_LEGS` | Armor: Legs |
| 8 | `INVTYPE_FEET` | Armor: Feet |
| 9 | `INVTYPE_WRISTS` | Armor: Wrists |
| 10 | `INVTYPE_HANDS` | Armor: Hands |
| 11 | `INVTYPE_FINGER` | Armor: Finger |
| 12 | `INVTYPE_TRINKET` | Armor: Trinket |
| 13 | `INVTYPE_WEAPON` | Weapon: One-Hand |
| 14 | `INVTYPE_SHIELD` | Armor: Shield |
| 15 | `INVTYPE_RANGED` | Weapon: Bow |
| 16 | `INVTYPE_CLOAK` | Armor: Back |
| 17 | `INVTYPE_2HWEAPON` | Weapon: Two-Hand |
| 18 | `INVTYPE_BAG` | Unsupported |
| 19 | `INVTYPE_TABARD` | Armor: Tabard |
| 20 | `INVTYPE_ROBE` | Armor: Robe |
| 21 | `INVTYPE_WEAPONMAINHAND` | Weapon: Main-Hand |
| 22 | `INVTYPE_WEAPONOFFHAND` | Weapon: Off-Hand |
| 23 | `INVTYPE_HOLDABLE` | Armor: Held Off-Hand |
| 24 | `INVTYPE_AMMO` | Unsupported |
| 25 | `INVTYPE_THROWN` | Weapon: Thrown |
| 26 | `INVTYPE_RANGEDRIGHT` | Weapon: Gun/Crossbow/Wand |
| 27 | `INVTYPE_QUIVER` | Unsupported |
| 28 | `INVTYPE_RELIC` | Armor: Relic |

The word `slot` in older calculator code means `InventoryType`. New code must
use `inventoryTypeId`; it must not accept or emit an `EquipmentSlots` index.

## Armor subclasses

| ID | AzerothCore constant | Calculator support |
|---:|---|---|
| 0 | `ITEM_SUBCLASS_ARMOR_MISC` | Supported |
| 1 | `ITEM_SUBCLASS_ARMOR_CLOTH` | Supported |
| 2 | `ITEM_SUBCLASS_ARMOR_LEATHER` | Supported |
| 3 | `ITEM_SUBCLASS_ARMOR_MAIL` | Supported |
| 4 | `ITEM_SUBCLASS_ARMOR_PLATE` | Supported |
| 5 | `ITEM_SUBCLASS_ARMOR_BUCKLER` | Obsolete; unsupported |
| 6 | `ITEM_SUBCLASS_ARMOR_SHIELD` | Supported |
| 7 | `ITEM_SUBCLASS_ARMOR_LIBRAM` | Supported |
| 8 | `ITEM_SUBCLASS_ARMOR_IDOL` | Supported |
| 9 | `ITEM_SUBCLASS_ARMOR_TOTEM` | Supported |
| 10 | `ITEM_SUBCLASS_ARMOR_SIGIL` | Supported |

## Weapon subclasses

| ID | AzerothCore constant | Calculator support |
|---:|---|---|
| 0 | `ITEM_SUBCLASS_WEAPON_AXE` | One-handed axe |
| 1 | `ITEM_SUBCLASS_WEAPON_AXE2` | Two-handed axe |
| 2 | `ITEM_SUBCLASS_WEAPON_BOW` | Bow |
| 3 | `ITEM_SUBCLASS_WEAPON_GUN` | Gun |
| 4 | `ITEM_SUBCLASS_WEAPON_MACE` | One-handed mace |
| 5 | `ITEM_SUBCLASS_WEAPON_MACE2` | Two-handed mace |
| 6 | `ITEM_SUBCLASS_WEAPON_POLEARM` | Polearm |
| 7 | `ITEM_SUBCLASS_WEAPON_SWORD` | One-handed sword |
| 8 | `ITEM_SUBCLASS_WEAPON_SWORD2` | Two-handed sword |
| 9 | `ITEM_SUBCLASS_WEAPON_obsolete` | Unsupported |
| 10 | `ITEM_SUBCLASS_WEAPON_STAFF` | Staff |
| 11 | `ITEM_SUBCLASS_WEAPON_EXOTIC` | Unsupported |
| 12 | `ITEM_SUBCLASS_WEAPON_EXOTIC2` | Unsupported |
| 13 | `ITEM_SUBCLASS_WEAPON_FIST` | Fist weapon |
| 14 | `ITEM_SUBCLASS_WEAPON_MISC` | Unsupported |
| 15 | `ITEM_SUBCLASS_WEAPON_DAGGER` | Dagger |
| 16 | `ITEM_SUBCLASS_WEAPON_THROWN` | Thrown |
| 17 | `ITEM_SUBCLASS_WEAPON_SPEAR` | Unsupported |
| 18 | `ITEM_SUBCLASS_WEAPON_CROSSBOW` | Crossbow |
| 19 | `ITEM_SUBCLASS_WEAPON_WAND` | Wand |
| 20 | `ITEM_SUBCLASS_WEAPON_FISHING_POLE` | Enum-known, model unsupported |

Subclass IDs are namespaced by `ItemClass`. Armor shield and weapon polearm
both have numeric ID 6; the number alone has no meaning.

## Calculator-supported tuples

The following matrix is exhaustive. Any tuple absent from it is unsupported
even if it exists in AzerothCore data.

### Armor (ItemClass 4)

| InventoryType | Supported subclass IDs |
|---|---|
| Head (1) | 1, 2, 3, 4 |
| Neck (2) | 0 |
| Shoulders (3) | 1, 2, 3, 4 |
| Shirt/Body (4) | 0 |
| Chest (5) | 1, 2, 3, 4 |
| Waist (6) | 1, 2, 3, 4 |
| Legs (7) | 1, 2, 3, 4 |
| Feet (8) | 1, 2, 3, 4 |
| Wrists (9) | 1, 2, 3, 4 |
| Hands (10) | 1, 2, 3, 4 |
| Finger (11) | 0 |
| Trinket (12) | 0 |
| Shield (14) | 6 |
| Cloak/Back (16) | 1 |
| Tabard (19) | 0 |
| Robe (20) | 1, 2, 3, 4 |
| Held Off-Hand (23) | 0 |
| Relic (28) | 7, 8, 9, 10 |

Shirts are Miscellaneous armor, not Cloth. AzerothCore's base table confirms
the standard tuple `(4, 4, 0)`.

### Weapon (ItemClass 2)

| InventoryType | Supported subclass IDs |
|---|---|
| One-Hand (13) | 0, 4, 7, 13, 15 |
| Ranged/Bow (15) | 2 |
| Two-Hand (17) | 1, 5, 6, 8, 10 |
| Main-Hand (21) | 0, 4, 7, 13, 15 |
| Off-Hand (22) | 0, 4, 7, 13, 15 |
| Thrown (25) | 16 |
| Ranged Right (26) | 3, 18, 19 |

Fishing poles use the valid AzerothCore tuple `(2, 17, 20)` but remain outside
the calculator until a validated damage/stat model is added.

## Weapon profiles and feral attack power

Profiles select calculator regressions only. They must be validated separately
from the identity tuple so an unsupported profile cannot silently fall back to
another curve.

AzerothCore's feral bonus is derived from weapon DPS for weapon inventory types
13, 17, 21, and 22. It is not restricted to staffs:

```text
feralBonus = max(0, trunc((weaponDps + extraDps) * 14) - 767)
```

The AzerothCore `ITEM_FLAG2_CLASSIFY_AS_CASTER`,
`ITEM_FLAG2_CLASSIFY_AS_PHYSICAL`, and `ITEM_FLAG2_CASTER_WEAPON` flags are
marked NYI. The calculator must therefore own and document its empirical
profile classification.

## Validation and serialization implications

At every calculation or future export boundary:

1. Parse IDs once as numbers and use strict equality.
2. Reject unknown ItemClass and unsupported quality before selecting a model.
3. Validate the complete class/inventory/subclass tuple.
4. Validate `weaponProfile` against the selected model independently.
5. Keep display names and localized labels out of calculation keys.
6. Return an explicit unsupported-model error; never substitute zero damage,
   `NaN`, level 1, or a different profile.

A future SQL serializer must write:

- `class` from `itemClassId`
- `subclass` from the class-namespaced `subclassId`
- `Quality` from `qualityId`
- `InventoryType` from `inventoryTypeId`

It must not serialize `weaponProfile`, display labels, or player
`EquipmentSlots`. Before emitting SQL, it must rerun the tuple and quality
validators and reject valid-but-unmodeled combinations such as fishing poles
unless their outputs were supplied by an explicitly supported model.
