import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  Group,
  Avatar,
  Text,
  Select,
  Badge,
  Loader,
  ActionIcon,
  Tooltip,
  Box,
  Notification,
  Button,
} from '@mantine/core';
import { IconRefresh, IconShieldLock, IconX, IconSearch, IconUserPlus } from '@tabler/icons-react';
import type { Usuario, RolDeUsuario } from '@/types/users';
import { userService } from '@/services';
import styles from '../styles/UserRolesTable.module.css';

const ROL_OPTIONS: { value: RolDeUsuario; label: string }[] = [
  { value: 'admin',      label: 'Administrador' },
  { value: 'empleado_a', label: 'Empleado A' },
  { value: 'empleado_b', label: 'Empleado B' },
  { value: 'cliente',    label: 'Cliente' },
];

function RolBadge({ rol }: { rol: RolDeUsuario }) {
  const map: Record<RolDeUsuario, { color: string; label: string }> = {
    admin:      { color: '#4287f5', label: 'Admin' },
    empleado_a: { color: '#85b4ff', label: 'Empleado A' },
    empleado_b: { color: '#b5d2ff', label: 'Empleado B' },
    cliente:    { color: 'blue',    label: 'Cliente' },
  };
  const info = map[rol];
  return (
    <Badge color={info.color} variant="light">
      {info.label}
    </Badge>
  );
}

export default function UserRolesTable() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // estado de búsqueda
  const [q, setQ] = useState('');

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.fetchUsuarios();
      setUsuarios(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  // lista filtrada por username
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return usuarios;
    return usuarios.filter((u) => u.username.toLowerCase().includes(term));
  }, [usuarios, q]);

  const rows = useMemo(
    () =>
      list.map((u) => (
        <Table.Tr key={u.id} className={styles.tr}>
          <Table.Td className={styles.td}>
            <div className={styles.userCell}>
              <Avatar radius="xl" color="blue">
                {u.username.slice(0, 2).toUpperCase()}
              </Avatar>
              <div>
                <Text className={styles.username}>{u.username}</Text>
                <Box className={styles.badgeRow}>
                  <RolBadge rol={u.rol} />
                </Box>
              </div>
            </div>
          </Table.Td>

          <Table.Td className={`${styles.td} ${styles.roleCell}`}>
            <Select
              className={styles.select}
              data={ROL_OPTIONS}
              value={u.rol}
              onChange={async (val) => {
                if (!val || val === u.rol) return;
                setSavingId(u.id);
                setError(null);
                try {
                  const updated = await userService.updateRolUsuario(u.id, val as RolDeUsuario);
                  setUsuarios((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
                } catch (e: any) {
                  setError(e?.message ?? 'No se pudo actualizar el rol');
                } finally {
                  setSavingId(null);
                }
              }}
              leftSection={<IconShieldLock size={16} />}
              disabled={savingId === u.id}
              allowDeselect={false}
              classNames={{
                input: styles.selectInput,
                dropdown: styles.dropdown,
              }}
            />
          </Table.Td>
        </Table.Tr>
      )),
    [list, savingId]
  );

  return (
    <section className={styles.wrap}>
      {/* Header título + refrescar */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <Text className={styles.title} fz="lg" fw={500}>
            Administrar usuarios
          </Text>
        </div>

        <Tooltip label="Refrescar">
          <ActionIcon
            variant="subtle"
            onClick={cargar}
            aria-label="Refrescar"
            className={styles.refresh}
          >
            <IconRefresh />
          </ActionIcon>
        </Tooltip>
      </div>

      {/* Toolbar: Searchbar estilo Historial + botón agregar */}
      <div className={styles.toolbar}>
        <div className={styles.topBar}>
          <div className={styles.searchWrap} role="search">
            <IconSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              value={q}
              onChange={(e) => setQ(e.currentTarget.value)}
              placeholder="Buscar usuario por nombre…"
              aria-label="Buscar usuarios por nombre"
            />
            {q && (
              <button
                type="button"
                className={styles.clearBtn}
                aria-label="Limpiar búsqueda"
                onClick={() => setQ('')}
              >
                ×
              </button>
            )}
          </div>
        </div>

        <Button
          className={styles.addBtn}
          leftSection={<IconUserPlus size={18} />}
          onClick={() => {
            // TODO: abrir modal o navegar a formulario de alta
            // p.ej: navigate('/admin/users/new') o setOpened(true)
            console.log('Añadir nuevo usuario');
          }}
        >
          Añadir nuevo usuario
        </Button>
      </div>

      {error && (
        <Notification color="red" withCloseButton={false} icon={<IconX />}>
          {error}
        </Notification>
      )}

      <Table withTableBorder withColumnBorders className={styles.tableAdmin}>
        <Table.Thead className={styles.thead}>
          <Table.Tr>
            <Table.Th className={`${styles.th} ${styles.thUser}`}>Nombre</Table.Th>
            <Table.Th className={`${styles.th} ${styles.thRol}`}>Rol</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {loading ? (
            <Table.Tr>
              <Table.Td colSpan={2}>
                <Group justify="center" py="xl">
                  <Loader />
                </Group>
              </Table.Td>
            </Table.Tr>
          ) : (
            rows
          )}
        </Table.Tbody>
      </Table>
    </section>
  );
}
