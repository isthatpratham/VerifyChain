/**
 * FolderService.js
 * Hierarchical Enterprise Folder Management Service (Phase 10.3).
 * Supports root/nested folders, breadcrumb trees, document counts, storage stats, move, rename, archive, and restore.
 */

const defaultPrisma = require('../../utils/prismaClient');
const VaultAuditPublisher = require('../infrastructure/VaultAuditPublisher');

class FolderService {
  /**
   * Create a new Vault Folder
   */
  static async createFolder({
    name,
    description = null,
    parentId = null,
    icon = 'Folder',
    color = '#3B82F6',
    msmeId = 1,
    createdBy = 'SYSTEM',
  }, client = defaultPrisma) {
    if (!name || !name.trim()) throw new Error('Folder name is required.');

    let parentRecord = null;
    if (parentId) {
      parentRecord = await client.vaultFolder.findUnique({ where: { id: parseInt(parentId, 10) } });
      if (!parentRecord) throw new Error(`Parent folder ID ${parentId} not found.`);
    }

    const folder = await client.vaultFolder.create({
      data: {
        msme_id: msmeId,
        name: name.trim(),
        description,
        parent_id: parentRecord ? parentRecord.id : null,
        icon,
        color,
        created_by: createdBy,
      },
    });

    await VaultAuditPublisher.publishVaultEvent({
      action: 'VAULT_FOLDER_CREATED',
      actorId: createdBy,
      msmeId,
      details: { folderId: folder.folder_id, name: folder.name, parentId: folder.parent_id },
    });

    return folder;
  }

  /**
   * Get Folder Hierarchy Tree for MSME
   */
  static async getFolderTree(msmeId = 1, client = defaultPrisma) {
    const folders = await client.vaultFolder.findMany({
      where: { msme_id: msmeId, is_archived: false },
      include: {
        _count: { select: { assets: true } },
      },
      orderBy: { name: 'asc' },
    });

    const folderMap = new Map();
    folders.forEach(f => folderMap.set(f.id, { ...f, children: [], documentCount: f._count.assets }));

    const rootFolders = [];
    folderMap.forEach(f => {
      if (f.parent_id && folderMap.has(f.parent_id)) {
        folderMap.get(f.parent_id).children.push(f);
      } else {
        rootFolders.push(f);
      }
    });

    return rootFolders;
  }

  /**
   * Get Folder Details with Breadcrumbs and Storage Stats
   */
  static async getFolderDetails(folderId, msmeId = 1, client = defaultPrisma) {
    const folder = await client.vaultFolder.findFirst({
      where: {
        OR: [
          { folder_id: folderId },
          { id: isNaN(Number(folderId)) ? -1 : Number(folderId) },
        ],
        msme_id: msmeId,
      },
      include: {
        assets: true,
        _count: { select: { assets: true } },
      },
    });

    if (!folder) throw new Error(`Folder '${folderId}' not found.`);

    // Build Breadcrumbs
    const breadcrumbs = [];
    let current = folder;
    while (current) {
      breadcrumbs.unshift({ id: current.id, folderId: current.folder_id, name: current.name });
      if (current.parent_id) {
        current = await client.vaultFolder.findUnique({ where: { id: current.parent_id } });
      } else {
        current = null;
      }
    }

    const totalBytes = folder.assets.reduce((sum, a) => sum + (a.file_size || 0), 0);

    return {
      folder: {
        id: folder.id,
        folderId: folder.folder_id,
        name: folder.name,
        description: folder.description,
        icon: folder.icon,
        color: folder.color,
        isArchived: folder.is_archived,
        documentCount: folder._count.assets,
        storageBytes: totalBytes,
        storageMb: parseFloat((totalBytes / (1024 * 1024)).toFixed(2)),
      },
      breadcrumbs,
      assets: folder.assets,
    };
  }

  /**
   * Move Folder / Rename / Update Metadata
   */
  static async updateFolder(folderId, { name, description, parentId, icon, color }, client = defaultPrisma) {
    const folder = await client.vaultFolder.findFirst({
      where: { OR: [{ folder_id: folderId }, { id: isNaN(Number(folderId)) ? -1 : Number(folderId) }] },
    });

    if (!folder) throw new Error(`Folder '${folderId}' not found.`);

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;
    if (icon) updateData.icon = icon;
    if (color) updateData.color = color;
    if (parentId !== undefined) {
      updateData.parent_id = parentId ? parseInt(parentId, 10) : null;
    }

    return await client.vaultFolder.update({
      where: { id: folder.id },
      data: updateData,
    });
  }

  /**
   * Soft Delete / Archive Folder
   */
  static async archiveFolder(folderId, client = defaultPrisma) {
    const folder = await client.vaultFolder.findFirst({
      where: { OR: [{ folder_id: folderId }, { id: isNaN(Number(folderId)) ? -1 : Number(folderId) }] },
    });

    if (!folder) throw new Error(`Folder '${folderId}' not found.`);

    return await client.vaultFolder.update({
      where: { id: folder.id },
      data: { is_archived: true },
    });
  }
}

module.exports = FolderService;
